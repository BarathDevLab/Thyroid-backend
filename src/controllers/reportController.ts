import { Request, Response } from 'express';
import Report from '../models/Report.js';
import User from '../models/User.js';
import { getGeminiResponse } from '../services/aiService.js';

const resolveUser = async (req: Request) => {
  const userId = (req as any).user?.userId;
  if (userId) {
    const user = await User.findById(userId);
    if (user) return user;
  }

  let user = await User.findOne({ email: 'demo@local' });
  if (!user) {
    user = await User.create({
      name: 'Local User',
      email: 'demo@local',
      role: 'user'
    });
  }
  return user;
};

const getRiskLevel = (analysis: any) => {
  const level = analysis?.riskLevel || analysis?.risk_level;
  if (!level) return 'Low';
  return String(level).toLowerCase() === 'high'
    ? 'High'
    : String(level).toLowerCase() === 'moderate'
      ? 'Moderate'
      : 'Low';
};

const getRiskScore = (analysis: any) => {
  if (typeof analysis?.riskScore === 'number') return analysis.riskScore;
  const level = getRiskLevel(analysis);
  return level === 'High' ? 30 : level === 'Moderate' ? 60 : 85;
};

const getAnalysisField = (report: any, key: string) => {
  return report?.analysis?.[key] ?? report?.data?.[key];
};

export const createReport = async (req: Request, res: Response) => {
  try {
    const user = await resolveUser(req);
    const { fileName, fileUrl, analysis, rawText, originalText, sourceType, status } = req.body;

    if (!analysis) {
      return res.status(400).json({ message: 'Analysis payload is required' });
    }

    const normalizedAnalysis = {
      ...analysis,
      riskLevel: analysis.riskLevel || analysis.risk_level,
      riskScore: typeof analysis.riskScore === 'number' ? analysis.riskScore : getRiskScore(analysis)
    };

    const newReport = await Report.create({
      userId: user._id,
      fileName: fileName || 'scan',
      fileUrl: fileUrl || '',
      analysis: normalizedAnalysis,
      originalText: originalText || rawText,
      sourceType: sourceType || 'ultrasound',
      status: status || 'complete'
    });

    res.status(201).json(newReport);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const analyzeReport = async (req: Request, res: Response) => {
  try {
    const user = await resolveUser(req);
    const { fileName, fileUrl, rawText } = req.body;

    const prompt = `Analyze this thyroid report and provide a JSON object with: tsh, t3, t4, antiTPO, noduleDetected (boolean), noduleSize, and summary. 
    Report Text: ${rawText}`;

    const aiResponse = await getGeminiResponse([], prompt);

    let reportData;
    try {
      const parsed = JSON.parse(aiResponse);
      reportData = {
        tsh: parsed.tsh || 0,
        t3: parsed.t3 || 0,
        t4: parsed.t4 || 0,
        antiTPO: parsed.antiTPO || 0,
        noduleDetected: !!parsed.noduleDetected,
        noduleSize: parsed.noduleSize || 'N/A',
        summary: parsed.summary || 'No summary available.'
      };
    } catch (e) {
      reportData = {
        tsh: 0,
        t3: 0,
        t4: 0,
        noduleDetected: false,
        summary: aiResponse.substring(0, 500)
      };
    }

    const newReport = await Report.create({
      userId: user._id,
      fileName,
      fileUrl,
      analysis: reportData,
      originalText: rawText,
      sourceType: 'lab-report',
      status: 'complete'
    });

    res.status(201).json(newReport);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getReportHistory = async (req: Request, res: Response) => {
  try {
    const user = await resolveUser(req);
    const reports = await Report.find({ userId: user._id }).sort({ analyzedDate: -1 });
    res.status(200).json(reports);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getReportSummary = async (req: Request, res: Response) => {
  try {
    const user = await resolveUser(req);
    const reports = await Report.find({ userId: user._id }).sort({ analyzedDate: -1 });
    const latest = reports[0];

    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthBuckets = Array.from({ length: 8 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (7 - i), 1);
      return {
        key: `${d.getFullYear()}-${d.getMonth()}`,
        month: monthNames[d.getMonth()],
        scans: 0,
        tsh: [] as number[],
        t3: [] as number[],
        t4: [] as number[]
      };
    });

    for (const report of reports) {
      const d = new Date(report.analyzedDate || report.createdAt || Date.now());
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = monthBuckets.find((b) => b.key === key);
      if (!bucket) continue;
      bucket.scans += 1;

      const tsh = getAnalysisField(report, 'tsh');
      const t3 = getAnalysisField(report, 't3');
      const t4 = getAnalysisField(report, 't4');
      if (typeof tsh === 'number') bucket.tsh.push(tsh);
      if (typeof t3 === 'number') bucket.t3.push(t3);
      if (typeof t4 === 'number') bucket.t4.push(t4);
    }

    const tshTrendData = monthBuckets.map((b) => ({
      month: b.month,
      TSH: b.tsh.length ? Number((b.tsh.reduce((a, v) => a + v, 0) / b.tsh.length).toFixed(2)) : 0,
      T3: b.t3.length ? Number((b.t3.reduce((a, v) => a + v, 0) / b.t3.length).toFixed(2)) : 0,
      T4: b.t4.length ? Number((b.t4.reduce((a, v) => a + v, 0) / b.t4.length).toFixed(2)) : 0
    }));

    const monthlyScanData = monthBuckets.map((b) => ({ month: b.month, scans: b.scans }));

    const riskCounts = { Low: 0, Moderate: 0, High: 0 } as Record<string, number>;
    reports.forEach((report) => {
      const level = getRiskLevel(report.analysis || report.data);
      riskCounts[level] = (riskCounts[level] || 0) + 1;
    });
    const total = reports.length || 1;
    const riskDistributionData = [
      { name: 'Low Risk', value: Math.round((riskCounts.Low / total) * 100), color: '#22c55e' },
      { name: 'Moderate', value: Math.round((riskCounts.Moderate / total) * 100), color: '#facc15' },
      { name: 'High Risk', value: Math.round((riskCounts.High / total) * 100), color: '#ef4444' }
    ];

    const recentScans = reports.slice(0, 4).map((report) => {
      const analysis = report.analysis || report.data || {};
      return {
        id: String(report._id),
        date: new Date(report.analyzedDate || report.createdAt || Date.now()).toISOString().slice(0, 10),
        type: report.sourceType || 'Ultrasound',
        riskLevel: getRiskLevel(analysis),
        score: getRiskScore(analysis),
        status: report.status || 'Complete',
        notes: analysis.summary || analysis.recommendation || 'Scan completed.',
        tsh: analysis.tsh || 0,
        t3: analysis.t3 || 0,
        t4: analysis.t4 || 0
      };
    });

    const latestAnalysis = latest?.analysis || latest?.data || {};
    const aiInsights = [
      { feature: 'TSH Level', importance: 82, direction: 'normal', value: latestAnalysis.tsh ? `${latestAnalysis.tsh} mIU/L` : 'N/A' },
      { feature: 'T3 Free', importance: 68, direction: 'normal', value: latestAnalysis.t3 ? `${latestAnalysis.t3} pg/mL` : 'N/A' },
      { feature: 'T4 Free', importance: 54, direction: 'normal', value: latestAnalysis.t4 ? `${latestAnalysis.t4} ng/dL` : 'N/A' },
      { feature: 'Anti-TPO', importance: 35, direction: 'normal', value: latestAnalysis.antiTPO ? `${latestAnalysis.antiTPO} IU/mL` : 'N/A' },
      { feature: 'Nodule Size', importance: 41, direction: latestAnalysis.noduleDetected ? 'high' : 'low', value: latestAnalysis.noduleSize || 'Not detected' }
    ];

    res.status(200).json({
      user: {
        name: user.name,
        email: user.email,
        age: user.age || null,
        gender: user.gender || null,
        bloodType: user.bloodType || null,
        lastScan: latest ? new Date(latest.analyzedDate || latest.createdAt || Date.now()).toISOString().slice(0, 10) : 'N/A',
        totalScans: reports.length,
        healthScore: latest ? getRiskScore(latestAnalysis) : 0,
        riskLevel: latest ? getRiskLevel(latestAnalysis) : 'Low',
        doctor: 'Dr. James Chen',
        location: 'Local'
      },
      tshTrendData,
      monthlyScanData,
      riskDistributionData,
      recentScans,
      aiInsights
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

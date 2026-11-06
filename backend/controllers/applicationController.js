const Application = require("../models/Application");

const allowedStatuses = ["Applied", "Shortlisted", "Interview", "Rejected"];

exports.createApplication = async (req, res, next) => {
  try {
    const { name, email, phone, jobRole, skills } = req.body;

    if (!name || !email || !phone || !jobRole || !Array.isArray(skills) || !skills.length) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone, job role and at least one skill are required"
      });
    }

    const cleanSkills = skills.map((skill) => String(skill).trim()).filter(Boolean);
    if (!cleanSkills.length) {
      return res.status(400).json({ success: false, message: "Enter at least one valid skill" });
    }

    const application = await Application.create({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),
      jobRole: String(jobRole).trim(),
      skills: cleanSkills
    });

    return res.status(201).json({
      success: true,
      message: "Your job application was submitted successfully",
      application
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job role with this email"
      });
    }
    next(error);
  }
};

exports.getApplications = async (req, res, next) => {
  try {
    const {
      search = "",
      jobRole = "",
      status = "",
      page = "1",
      limit = "10"
    } = req.query;

    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const pageLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
    const filter = {};

    if (search.trim()) {
      const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { email: { $regex: safeSearch, $options: "i" } }
      ];
    }
    if (jobRole.trim()) filter.jobRole = jobRole.trim();
    if (status && allowedStatuses.includes(status)) filter.status = status;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * pageLimit)
        .limit(pageLimit)
        .lean(),
      Application.countDocuments(filter)
    ]);

    res.json({
      success: true,
      applications,
      pagination: {
        total,
        page: currentPage,
        limit: pageLimit,
        totalPages: Math.ceil(total / pageLimit)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getStatistics = async (req, res, next) => {
  try {
    const counts = await Application.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const statistics = { total: 0, Applied: 0, Shortlisted: 0, Interview: 0, Rejected: 0 };
    counts.forEach(({ _id, count }) => {
      statistics[_id] = count;
      statistics.total += count;
    });
    res.json({ success: true, statistics });
  } catch (error) {
    next(error);
  }
};

exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid application status" });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }
    res.json({ success: true, message: "Application status updated", application });
  } catch (error) {
    next(error);
  }
};

exports.deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }
    res.json({ success: true, message: "Application deleted successfully" });
  } catch (error) {
    next(error);
  }
};

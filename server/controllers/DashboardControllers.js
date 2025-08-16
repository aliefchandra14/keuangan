const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ============================
// GET ALL DASHBOARD DATA
// ============================

const broadcastDashboardUpdate = async (io) => {
  const [goals, outcomes, records] = await Promise.all([
    prisma.goal.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.outcome.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.record.findMany({ orderBy: { createdAt: 'desc' } }),
  ]);

  const totalOutcome = outcomes.reduce((acc, item) => {
    const clean = Number(item.total.replace(/\./g, ''));
    return acc + (isNaN(clean) ? 0 : clean);
  }, 0);

  const grouped = records.reduce((acc, rec) => {
    const type = rec.type_invest;
    if (!acc[type]) acc[type] = 0;
    acc[type] += Number(rec.total);
    return acc;
  }, {});

  const rekapInvest = Object.entries(grouped).map(([type_invest, total_terkumpul]) => {
    const goal = goals.find(g => g.title === type_invest);
    return {
      id: goal ? goal.id : null,
      type_invest,
      total_terkumpul: String(total_terkumpul),
      target: goal ? goal.target : '0',
    };
  });

  io.emit('dashboardUpdate', { goals, outcomes, records, totalOutcome, rekapInvest });
};

exports.getAll = async (req, res) => {
  try {
    const [goals, outcomes, records] = await Promise.all([
      prisma.goal.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.outcome.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.record.findMany({ orderBy: { createdAt: 'desc' } })
    ]);

    // Hitung total outcome
    const totalOutcome = outcomes.reduce((acc, item) => {
      const clean = Number(item.total.replace(/\./g, ""));
      return acc + (isNaN(clean) ? 0 : clean);
    }, 0);

    // Rekap berdasarkan type_invest
    const grouped = records.reduce((acc, rec) => {
      const type = rec.type_invest;
      if (!acc[type]) acc[type] = 0;
      acc[type] += Number(rec.total);
      return acc;
    }, {});

    // Map semua goals, meskipun belum ada record
    const rekapInvest = goals.map((goal) => {
      const total_terkumpul = grouped[goal.title] || 0;
      return {
        id: goal.id,
        type_invest: goal.title,
        total_terkumpul: String(total_terkumpul),
        target: goal.target,
      };
    });

    res.status(200).json({
      success: true,
      data: { goals, outcomes, records, totalOutcome, rekapInvest }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: error.message });
  }
};



// ============================
// GOALS
// ============================
exports.getGoals = async (req, res) => {
  try {
    const goals = await prisma.goal.findMany({ orderBy: { createdAt: 'desc' } });
    res.status(200).json({ success: true, data: goals });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

exports.createGoal = async (req, res) => {
  try {
    const { title, target } = req.body;
    if (!title || !target) {
      return res.status(400).json({ success: false, msg: 'Title dan target wajib diisi' });
    }

    const newGoal = await prisma.goal.create({ data: { title, target } });
    await broadcastDashboardUpdate(req.io);
    res.status(201).json({ success: true, msg: 'Goal berhasil dibuat!', data: newGoal });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const existingGoal = await prisma.goal.findFirst({ where: { id } });

    if (!existingGoal) {
      return res.status(404).json({ success: false, msg: 'Goal tidak ditemukan' });
    }

    await prisma.goal.delete({ where: { id } });
    await broadcastDashboardUpdate(req.io);
    res.status(200).json({ success: true, msg: 'Goal berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// ============================
// RECORDS
// ============================
exports.getRecords = async (req, res) => {
  try {
    const records = await prisma.record.findMany({ orderBy: { createdAt: 'desc' } });
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

exports.createRecord = async (req, res) => {
  try {
    const {
      bulan,
      tahun,
      income,
      outcome,
      emergency_outcome,
      emergency_outcome_reason,
      type_invest,
      total
    } = req.body;

    console.log(req.body);

    if (!bulan || !tahun) {
      return res.status(400).json({ success: false, msg: 'Bulan dan tahun wajib diisi' });
    }

    const newRecord = await prisma.record.create({
      data: {
        bulan,
        tahun: parseInt(tahun), // ✅ ubah ke integer
        income: String(income), // ✅ ubah ke string
        outcome: String(outcome), // ✅ ubah ke string
        emergency_outcome: String(emergency_outcome || "0"), // ✅ aman walau kosong
        emergency_outcome_reason: emergency_outcome_reason || "",
        type_invest,
        total: String(total) // ✅ ubah ke string
      }
    });
  await broadcastDashboardUpdate(req.io);
    res.status(201).json({ success: true, msg: 'Record berhasil dibuat', data: newRecord });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};


exports.deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.record.findFirst({ where: { id } });

    if (!existing) {
      return res.status(404).json({ success: false, msg: 'Record tidak ditemukan' });
    }

    await prisma.record.delete({ where: { id } });
    await broadcastDashboardUpdate(req.io);
    res.status(200).json({ success: true, msg: 'Record berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// ============================
// OUTCOMES
// ============================
exports.getOutcomes = async (req, res) => {
  try {
    const outcomes = await prisma.outcome.findMany({ orderBy: { createdAt: 'desc' } });

    res.status(200).json({ success: true, data: outcomes });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

exports.createOutcome = async (req, res) => {
  try {
    const { title, price, quantity, total } = req.body;
    if (!title || !price || quantity === undefined || !total) {
      return res.status(400).json({ success: false, msg: 'Title, price, qty, dan total wajib diisi' });
    }
    const newOutcome = await prisma.outcome.create({ data: { title, price, qty: parseFloat(quantity), total } });
    await broadcastDashboardUpdate(req.io);
    res.status(201).json({ success: true, msg: 'Outcome berhasil dibuat', data: newOutcome });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

exports.deleteOutcome = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.outcome.findFirst({ where: { id } });

    if (!existing) {
      return res.status(404).json({ success: false, msg: 'Outcome tidak ditemukan' });
    }

    await prisma.outcome.delete({ where: { id } });
    await broadcastDashboardUpdate(req.io);
    res.status(200).json({ success: true, msg: 'Outcome berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

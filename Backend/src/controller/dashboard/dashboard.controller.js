const Order = require('../../model/order.model');
const User = require('../../model/user.model');
const Admin = require('../../model/admin.model');
const Product = require('../../model/product.model');
const Category = require('../../model/category.model');
const SubCategory = require('../../model/subCategory.model');
const ExtraCategory = require('../../model/extraCategory.model');
const Session = require('../../model/session.model');
const moment = require('moment');

const getFilterQuery = (range, startDate, endDate) => {
    let query = {};
    if (!range) range = 'This Month';
    
    let start;
    let end = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
    
    if (range === 'Today') {
        start = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
    } else if (range === 'This Week') {
        start = moment().startOf('week').format('YYYY-MM-DD HH:mm:ss');
    } else if (range === 'This Month') {
        start = moment().startOf('month').format('YYYY-MM-DD HH:mm:ss');
    } else if (range === 'This Year') {
        start = moment().startOf('year').format('YYYY-MM-DD HH:mm:ss');
    } else if (range === 'Custom' && startDate && endDate) {
        start = moment(startDate).startOf('day').format('YYYY-MM-DD HH:mm:ss');
        end = moment(endDate).endOf('day').format('YYYY-MM-DD HH:mm:ss');
    }
    
    if (start) {
        query.createAt = { $gte: start, $lte: end };
    }
    return query;
};

const getStats = async (req, res) => {
    try {
        const { range, startDate, endDate } = req.query;
        const dateFilter = getFilterQuery(range, startDate, endDate);

        // Core stats
        const admins = await Admin.countDocuments({ isDelete: false });
        const users = await User.countDocuments({ isDelete: false });
        const products = await Product.countDocuments({ isDelete: false });
        
        const catCount = await Category.countDocuments();
        const subCount = await SubCategory.countDocuments();
        const extraCount = await ExtraCategory.countDocuments();
        const categories = catCount + subCount + extraCount;

        // Financials (only on paid orders)
        const paidOrders = await Order.find({ payment: 'Paid', ...dateFilter });
        const revenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
        // platform earnings (e.g. 100% of revenue or custom commission margin)
        const earnings = revenue;

        // YTD Progress calculation
        const currentYearStart = moment().startOf('year').format('YYYY-MM-DD HH:mm:ss');
        const currentYearEnd = moment().endOf('year').format('YYYY-MM-DD HH:mm:ss');
        const yearPaid = await Order.find({ payment: 'Paid', createAt: { $gte: currentYearStart, $lte: currentYearEnd } });
        const yearRevenue = yearPaid.reduce((sum, o) => sum + o.total, 0);
        const YTD_TARGET = 1000000; // 10 Lakhs target
        const ytdProgress = yearRevenue > 0 ? Math.min(100, Math.round((yearRevenue / YTD_TARGET) * 100)) : 0;

        // Revenue Growth calculation (comparison of this month vs last month)
        const thisMonthStart = moment().startOf('month').format('YYYY-MM-DD HH:mm:ss');
        const thisMonthEnd = moment().endOf('month').format('YYYY-MM-DD HH:mm:ss');
        const lastMonthStart = moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD HH:mm:ss');
        const lastMonthEnd = moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD HH:mm:ss');

        const thisMonthPaid = await Order.find({ payment: 'Paid', createAt: { $gte: thisMonthStart, $lte: thisMonthEnd } });
        const lastMonthPaid = await Order.find({ payment: 'Paid', createAt: { $gte: lastMonthStart, $lte: lastMonthEnd } });

        const thisMonthRevenue = thisMonthPaid.reduce((sum, o) => sum + o.total, 0);
        const lastMonthRevenue = lastMonthPaid.reduce((sum, o) => sum + o.total, 0);

        let revenueGrowth = 0;
        if (lastMonthRevenue > 0) {
            revenueGrowth = Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100);
        } else if (thisMonthRevenue > 0) {
            revenueGrowth = 100;
        }

        // Daily revenue sparkline of last 30 days
        const sparklinePoints = [];
        for (let i = 29; i >= 0; i--) {
            const day = moment().subtract(i, 'days');
            const start = day.startOf('day').format('YYYY-MM-DD HH:mm:ss');
            const end = day.endOf('day').format('YYYY-MM-DD HH:mm:ss');
            const dayPaid = await Order.find({ payment: 'Paid', createAt: { $gte: start, $lte: end } });
            const dayRev = dayPaid.reduce((sum, o) => sum + o.total, 0);
            sparklinePoints.push(dayRev);
        }

        // Pending and processing categories
        const pending = await Order.countDocuments({ status: 'Pending', ...dateFilter });
        const processing = await Order.countDocuments({ status: 'Confirmed', ...dateFilter });
        const awaitingPayment = await Order.countDocuments({ payment: 'Pending', ...dateFilter });
        const onHold = await Order.countDocuments({ status: 'Pending', method: 'COD', ...dateFilter });

        // Fulfillment Rate
        const totalOrders = await Order.countDocuments(dateFilter);
        const fulfilledOrders = await Order.countDocuments({
            status: { $in: ['Delivered', 'Shipped'] },
            ...dateFilter
        });
        const fulfillmentRate = totalOrders > 0 ? Math.round((fulfilledOrders / totalOrders) * 100) : 100;

        // Active Live Visitors (tracked sessions in last 5 minutes)
        const activeCutoff = moment().subtract(5, 'minutes').toDate();
        const liveVisitors = await Session.countDocuments({ last_active: { $gte: activeCutoff } });

        // Order status distribution
        const statusDelivered = await Order.countDocuments({ status: 'Delivered', ...dateFilter });
        const statusShipped = await Order.countDocuments({ status: 'Shipped', ...dateFilter });
        const statusProcessing = await Order.countDocuments({ status: 'Confirmed', ...dateFilter });
        const statusPending = await Order.countDocuments({ status: 'Pending', ...dateFilter });
        
        const statusDistribution = {
            Delivered: totalOrders > 0 ? Math.round((statusDelivered / totalOrders) * 100) : 0,
            Shipped: totalOrders > 0 ? Math.round((statusShipped / totalOrders) * 100) : 0,
            Processing: totalOrders > 0 ? Math.round((statusProcessing / totalOrders) * 100) : 0,
            Pending: totalOrders > 0 ? Math.round((statusPending / totalOrders) * 100) : 0,
        };

        // Top products aggregated by units sold
        const topProductsRaw = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' }, ...dateFilter } },
            { $unwind: '$items' },
            { $group: { _id: '$items.name', units: { $sum: '$items.qty' }, totalRev: { $sum: { $multiply: ['$items.qty', '$items.price'] } } } },
            { $sort: { units: -1 } },
            { $limit: 5 }
        ]);

        const maxUnits = topProductsRaw.length > 0 ? topProductsRaw[0].units : 1;
        const topProducts = topProductsRaw.map(p => ({
            name: p._id,
            units: p.units,
            rev: `₹${p.totalRev.toLocaleString()}`,
            pct: Math.round((p.units / maxUnits) * 100)
        }));

        // Recent Orders list
        const recentOrdersRaw = await Order.find(dateFilter)
            .sort({ createAt: -1 })
            .limit(6)
            .populate('user_id', 'first_name last_name email');

        const recentOrders = recentOrdersRaw.map(o => ({
            id: o._id.toString().slice(-8).toUpperCase(),
            product: o.items.length > 0 ? o.items[0].name : "Product",
            customer: o.user_id ? `${o.user_id.first_name} ${o.user_id.last_name}` : "Guest",
            amount: `₹${o.total.toLocaleString()}`,
            status: o.status,
            time: moment(o.createAt, 'YYYY-MM-DD HH:mm:ss').fromNow(),
            avatar: o.user_id ? (o.user_id.first_name[0] || 'G') : 'G'
        }));

        return res.status(200).json({
            status: 200,
            massage: "Stats fetched successfully",
            result: {
                admins,
                users,
                products,
                categories,
                revenue,
                earnings,
                pending,
                processing,
                awaitingPayment,
                onHold,
                fulfillmentRate,
                liveVisitors: Math.max(1, liveVisitors), // Always show at least 1 visitor (the current admin)
                statusDistribution,
                topProducts,
                recentOrders,
                totalOrders,
                ytdProgress,
                revenueGrowth,
                sparklinePoints
            }
        });
    } catch (error) {
        return res.status(500).json({ status: 500, massage: "Failed to load stats", error: error.message });
    }
};

const getCharts = async (req, res) => {
    try {
        const { view } = req.query; // 'daily' | 'weekly' | 'monthly' | 'yearly'
        let data = [];
        let labels = [];
        let thisPeriodTotal = 0;
        let lastPeriodTotal = 0;
        
        if (view === 'weekly') {
            for (let i = 6; i >= 0; i--) {
                const day = moment().subtract(i, 'days');
                const start = day.startOf('day').format('YYYY-MM-DD HH:mm:ss');
                const end = day.endOf('day').format('YYYY-MM-DD HH:mm:ss');
                
                const dayPaid = await Order.aggregate([
                    { $match: { payment: 'Paid', status: { $ne: 'Cancelled' }, createAt: { $gte: start, $lte: end } } },
                    { $group: { _id: null, total: { $sum: '$total' } } }
                ]);
                
                const total = dayPaid[0] ? dayPaid[0].total : 0;
                data.push(total);
                thisPeriodTotal += total;
                labels.push(day.format('ddd'));
            }
            
            // Previous 7 days
            for (let i = 13; i >= 7; i--) {
                const day = moment().subtract(i, 'days');
                const start = day.startOf('day').format('YYYY-MM-DD HH:mm:ss');
                const end = day.endOf('day').format('YYYY-MM-DD HH:mm:ss');
                
                const dayPaid = await Order.aggregate([
                    { $match: { payment: 'Paid', status: { $ne: 'Cancelled' }, createAt: { $gte: start, $lte: end } } },
                    { $group: { _id: null, total: { $sum: '$total' } } }
                ]);
                
                lastPeriodTotal += dayPaid[0] ? dayPaid[0].total : 0;
            }
        } else if (view === 'monthly') {
            for (let i = 11; i >= 0; i--) {
                const month = moment().subtract(i, 'months');
                const start = month.startOf('month').format('YYYY-MM-DD HH:mm:ss');
                const end = month.endOf('month').format('YYYY-MM-DD HH:mm:ss');
                
                const monthPaid = await Order.aggregate([
                    { $match: { payment: 'Paid', status: { $ne: 'Cancelled' }, createAt: { $gte: start, $lte: end } } },
                    { $group: { _id: null, total: { $sum: '$total' } } }
                ]);
                
                const total = monthPaid[0] ? monthPaid[0].total : 0;
                data.push(total);
                thisPeriodTotal += total;
                labels.push(month.format('MMM'));
            }
            
            // Previous 12 months
            for (let i = 23; i >= 12; i--) {
                const month = moment().subtract(i, 'months');
                const start = month.startOf('month').format('YYYY-MM-DD HH:mm:ss');
                const end = month.endOf('month').format('YYYY-MM-DD HH:mm:ss');
                
                const monthPaid = await Order.aggregate([
                    { $match: { payment: 'Paid', status: { $ne: 'Cancelled' }, createAt: { $gte: start, $lte: end } } },
                    { $group: { _id: null, total: { $sum: '$total' } } }
                ]);
                
                lastPeriodTotal += monthPaid[0] ? monthPaid[0].total : 0;
            }
        } else if (view === 'daily') {
            for (let i = 0; i < 24; i += 4) {
                const start = moment().startOf('day').add(i, 'hours').format('YYYY-MM-DD HH:mm:ss');
                const end = moment().startOf('day').add(i + 4, 'hours').format('YYYY-MM-DD HH:mm:ss');
                
                const hourPaid = await Order.aggregate([
                    { $match: { payment: 'Paid', status: { $ne: 'Cancelled' }, createAt: { $gte: start, $lte: end } } },
                    { $group: { _id: null, total: { $sum: '$total' } } }
                ]);
                
                const total = hourPaid[0] ? hourPaid[0].total : 0;
                data.push(total);
                thisPeriodTotal += total;
                labels.push(`${i}:00`);
            }
            
            // Yesterday's total
            const yesterdayStart = moment().subtract(1, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss');
            const yesterdayEnd = moment().subtract(1, 'day').endOf('day').format('YYYY-MM-DD HH:mm:ss');
            const yesterdayPaid = await Order.aggregate([
                { $match: { payment: 'Paid', status: { $ne: 'Cancelled' }, createAt: { $gte: yesterdayStart, $lte: yesterdayEnd } } },
                { $group: { _id: null, total: { $sum: '$total' } } }
            ]);
            lastPeriodTotal = yesterdayPaid[0] ? yesterdayPaid[0].total : 0;
        } else if (view === 'yearly') {
            for (let i = 4; i >= 0; i--) {
                const year = moment().subtract(i, 'years');
                const start = year.startOf('year').format('YYYY-MM-DD HH:mm:ss');
                const end = year.endOf('year').format('YYYY-MM-DD HH:mm:ss');
                
                const yearPaid = await Order.aggregate([
                    { $match: { payment: 'Paid', status: { $ne: 'Cancelled' }, createAt: { $gte: start, $lte: end } } },
                    { $group: { _id: null, total: { $sum: '$total' } } }
                ]);
                
                const total = yearPaid[0] ? yearPaid[0].total : 0;
                data.push(total);
                thisPeriodTotal += total;
                labels.push(year.format('YYYY'));
            }
            
            // Previous 5 years (years 5 to 9 ago)
            const prevStart = moment().subtract(9, 'years').startOf('year').format('YYYY-MM-DD HH:mm:ss');
            const prevEnd = moment().subtract(5, 'years').endOf('year').format('YYYY-MM-DD HH:mm:ss');
            const prevPaid = await Order.aggregate([
                { $match: { payment: 'Paid', status: { $ne: 'Cancelled' }, createAt: { $gte: prevStart, $lte: prevEnd } } },
                { $group: { _id: null, total: { $sum: '$total' } } }
            ]);
            lastPeriodTotal = prevPaid[0] ? prevPaid[0].total : 0;
        }
        
        return res.status(200).json({ status: 200, massage: "Chart data loaded", result: { data, labels, thisPeriodTotal, lastPeriodTotal } });
    } catch (error) {
        return res.status(500).json({ status: 500, massage: "Failed to generate charts", error: error.message });
    }
};

const exportData = async (req, res) => {
    try {
        const { type, format } = req.query;
        if (!type) {
            return res.status(400).json({ status: 400, massage: "Export type is required" });
        }
        
        let csvContent = "";
        let filename = `${type}_export_${moment().format('YYYYMMDD')}.csv`;
        
        if (type === 'Orders') {
            const orders = await Order.find().populate('user_id', 'first_name last_name email');
            csvContent = "Order ID,Customer,Email,Total,Payment Status,Order Status,Date\n";
            orders.forEach(o => {
                const name = o.user_id ? `${o.user_id.first_name} ${o.user_id.last_name}` : "Guest";
                const email = o.user_id ? o.user_id.email : "N/A";
                csvContent += `"${o._id}","${name}","${email}",${o.total},"${o.payment}","${o.status}","${o.createAt}"\n`;
            });
        } else if (type === 'Products') {
            const products = await Product.find({ isDelete: false });
            csvContent = "Product Name,SKU,Price,Stock,Status\n";
            products.forEach(p => {
                csvContent += `"${p.product_name}","${p.sku || ''}",${p.price},${p.stock},"${p.isActive ? 'Active' : 'Inactive'}"\n`;
            });
        } else if (type === 'Users') {
            const users = await User.find({ isDelete: false });
            csvContent = "User ID,First Name,Last Name,Email,Phone,Status,Joined Date\n";
            users.forEach(u => {
                csvContent += `"${u._id}","${u.first_name}","${u.last_name}","${u.email}","${u.phone || ''}","${u.isActive ? 'Active' : 'Inactive'}","${u.createAt || ''}"\n`;
            });
        } else if (type === 'Revenue') {
            const orders = await Order.find({ payment: 'Paid' });
            csvContent = "Date,Order ID,Total Amount,Payment Method\n";
            orders.forEach(o => {
                csvContent += `"${o.createAt}","${o._id}",${o.total},"${o.method}"\n`;
            });
        } else if (type === 'Dashboard Summary') {
            const ordersCount = await Order.countDocuments();
            const paidOrders = await Order.find({ payment: 'Paid' });
            const revenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
            const usersCount = await User.countDocuments({ isDelete: false });
            const productsCount = await Product.countDocuments({ isDelete: false });
            
            csvContent = "Metric,Value\n";
            csvContent += `Total Orders,${ordersCount}\n`;
            csvContent += `Total Revenue,₹${revenue}\n`;
            csvContent += `Total Customers,${usersCount}\n`;
            csvContent += `Total Products,${productsCount}\n`;
        }
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        return res.status(200).send(csvContent);
    } catch (error) {
        return res.status(500).json({ status: 500, massage: "Export failed", error: error.message });
    }
};

module.exports = {
    getStats,
    getCharts,
    exportData
};

import React, { JSX, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReportService, { SummaryFilters } from "../api/ReportService";
import CategoryService from "../api/CategoryService";
import { Category } from "../models/Category";
import { commonStyles } from "../styles/commonStyles";

interface CategoryBreakdown {
    categoryName: string;
    totalAmount: number;
    count: number;
    percentage: number;
}

interface MonthlyBreakdown {
    month: string;
    totalAmount: number;
    count: number;
}

interface SummaryData {
    totalAmount: number;
    totalCount: number;
    averageAmount: number;
    maxAmount: number;
    minAmount: number;
    categoryBreakdown: CategoryBreakdown[];
    monthlyBreakdown: MonthlyBreakdown[];
}

export default function UserExpenseReport(): JSX.Element {
    const navigate = useNavigate();
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
    const [selectedMonth, setSelectedMonth] = useState<string>("");

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
        const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");

        if (!token) {
            navigate("/login");
            return;
        }

        fetchCategories();
        fetchSummary();
    }, [navigate]);

    const fetchCategories = async () => {
        try {
            const response = await CategoryService.getAllCategories();
            setCategories(response.content);
        } catch (err: any) {
            console.error("Failed to load categories:", err);
        }
    };

    const fetchSummary = async () => {
        setLoading(true);
        setError(null);
        try {
            const filters: SummaryFilters = {};

            if (selectedCategoryId) {
                filters.categoryId = selectedCategoryId;
            }

            if (selectedMonth) {
                filters.month = selectedMonth;
            }

            const response = await ReportService.getSummary(filters);
            setSummary(response);
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || "Failed to load summary");
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = () => {
        fetchSummary();
    };

    const handleClearFilters = () => {
        setSelectedCategoryId("");
        setSelectedMonth("");
    };

    // Trigger fetch when filters are cleared
    useEffect(() => {
        if (!selectedCategoryId && !selectedMonth && summary !== null) {
            fetchSummary();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategoryId, selectedMonth]);

    const formatCurrency = (amount: number) => {
        return `$${amount.toFixed(2)}`;
    };

    const formatMonth = (monthString: string) => {
        const [year, month] = monthString.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short'
        });
    };

    const generatePieChart = (categories: CategoryBreakdown[]) => {
        if (categories.length === 0) return null;

        const colors = [
            '#3b82f6', // blue
            '#10b981', // green
            '#f59e0b', // amber
            '#ef4444', // red
            '#8b5cf6', // violet
            '#ec4899', // pink
            '#06b6d4', // cyan
            '#f97316', // orange
        ];

        let currentAngle = 0;
        const radius = 100;
        const centerX = 120;
        const centerY = 120;

        // Calculate dynamic height based on number of categories
        const legendStartY = 240;
        const legendItemHeight = 20;
        const svgHeight = legendStartY + (categories.length * legendItemHeight) + 10;

        return (
            <svg width="240" height={svgHeight} viewBox={`0 0 240 ${svgHeight}`} style={{ margin: '0 auto', display: 'block' }}>
                {categories.map((category, index) => {
                    const angle = (category.percentage / 100) * 360;

                    // Special case: if there's only one category with 100%, draw a full circle
                    if (categories.length === 1 || angle >= 359.9) {
                        return (
                            <circle
                                key={index}
                                cx={centerX}
                                cy={centerY}
                                r={radius}
                                fill={colors[index % colors.length]}
                                stroke="#fff"
                                strokeWidth="2"
                            />
                        );
                    }

                    const startAngle = currentAngle;
                    const endAngle = currentAngle + angle;

                    const x1 = centerX + radius * Math.cos((Math.PI * startAngle) / 180);
                    const y1 = centerY + radius * Math.sin((Math.PI * startAngle) / 180);
                    const x2 = centerX + radius * Math.cos((Math.PI * endAngle) / 180);
                    const y2 = centerY + radius * Math.sin((Math.PI * endAngle) / 180);

                    const largeArc = angle > 180 ? 1 : 0;

                    const pathData = [
                        `M ${centerX} ${centerY}`,
                        `L ${x1} ${y1}`,
                        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
                        'Z'
                    ].join(' ');

                    currentAngle = endAngle;

                    return (
                        <path
                            key={index}
                            d={pathData}
                            fill={colors[index % colors.length]}
                            stroke="#fff"
                            strokeWidth="2"
                        />
                    );
                })}

                {/* Legend */}
                {categories.map((category, index) => (
                    <g key={`legend-${index}`}>
                        <rect
                            x="10"
                            y={240 + index * 20}
                            width="12"
                            height="12"
                            fill={colors[index % colors.length]}
                            rx="2"
                        />
                        <text
                            x="28"
                            y={250 + index * 20}
                            fontSize="12"
                            fill="#374151"
                            fontFamily="system-ui, -apple-system, sans-serif"
                        >
                            {category.categoryName}: {category.percentage.toFixed(1)}%
                        </text>
                    </g>
                ))}
            </svg>
        );
    };

    const generateBarChart = (monthlyData: MonthlyBreakdown[]) => {
        if (monthlyData.length === 0) return null;

        const maxAmount = Math.max(...monthlyData.map(m => m.totalAmount));
        const barWidth = 40;
        const barSpacing = 20;
        const chartHeight = 250;
        const chartTopPadding = 20;
        const chartBottomPadding = 80;
        const chartLeftPadding = 60;
        const chartRightPadding = 20;

        const totalWidth = chartLeftPadding + (monthlyData.length * (barWidth + barSpacing)) + chartRightPadding;
        const totalHeight = chartHeight + chartTopPadding + chartBottomPadding;

        const barChartHeight = chartHeight - chartTopPadding;

        return (
            <svg
                width={totalWidth}
                height={totalHeight}
                viewBox={`0 0 ${totalWidth} ${totalHeight}`}
                style={{ margin: '0 auto', display: 'block', maxWidth: '100%' }}
            >
                {/* Y-axis */}
                <line
                    x1={chartLeftPadding}
                    y1={chartTopPadding}
                    x2={chartLeftPadding}
                    y2={chartHeight}
                    stroke="#d1d5db"
                    strokeWidth="2"
                />

                {/* X-axis */}
                <line
                    x1={chartLeftPadding}
                    y1={chartHeight}
                    x2={totalWidth - chartRightPadding}
                    y2={chartHeight}
                    stroke="#d1d5db"
                    strokeWidth="2"
                />

                {/* Y-axis labels */}
                {[0, 0.25, 0.5, 0.75, 1].map((factor, index) => {
                    const value = maxAmount * factor;
                    const y = chartHeight - (barChartHeight * factor);
                    return (
                        <g key={`y-label-${index}`}>
                            <line
                                x1={chartLeftPadding - 5}
                                y1={y}
                                x2={chartLeftPadding}
                                y2={y}
                                stroke="#d1d5db"
                                strokeWidth="1"
                            />
                            <text
                                x={chartLeftPadding - 10}
                                y={y + 4}
                                fontSize="11"
                                fill="#6b7280"
                                textAnchor="end"
                                fontFamily="system-ui, -apple-system, sans-serif"
                            >
                                ${value.toFixed(0)}
                            </text>
                        </g>
                    );
                })}

                {/* Bars and labels */}
                {monthlyData.map((month, index) => {
                    const barHeight = (month.totalAmount / maxAmount) * barChartHeight;
                    const x = chartLeftPadding + (index * (barWidth + barSpacing)) + barSpacing;
                    const y = chartHeight - barHeight;

                    return (
                        <g key={`bar-${index}`}>
                            {/* Bar */}
                            <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                fill="#3b82f6"
                                rx="4"
                            />

                            {/* Value on top of bar */}
                            <text
                                x={x + barWidth / 2}
                                y={y - 8}
                                fontSize="11"
                                fill="#374151"
                                textAnchor="middle"
                                fontWeight="600"
                                fontFamily="system-ui, -apple-system, sans-serif"
                            >
                                ${month.totalAmount.toFixed(0)}
                            </text>

                            {/* Month label */}
                            <text
                                x={x + barWidth / 2}
                                y={chartHeight + 20}
                                fontSize="11"
                                fill="#374151"
                                textAnchor="middle"
                                fontFamily="system-ui, -apple-system, sans-serif"
                            >
                                {formatMonth(month.month)}
                            </text>
                        </g>
                    );
                })}
            </svg>
        );
    };

    return (
        <div style={styles.container}>
        
            <div style={styles.content}>
                
                {loading ? (
                    <div style={styles.loading}>Loading...</div>
                ) : summary ? (
                    <>
                        {/* Stats Grid */}
                        <div style={styles.statsGrid}>

                            <div style={styles.statCard}>
                                <div style={styles.statContent}>
                                    <div style={styles.statLabel}>Manage Expense</div>
                                    <button
                                        style={styles.cardButton}
                                        onClick={() => navigate("/user/expenses")}
                                    >
                                        Go to Expenses
                                    </button>
                                </div>
                            </div>

                            <div style={styles.statCard}>
                                <div style={styles.statContent}>
                                    <div style={styles.statLabel}>Total Amount</div>
                                    <div style={styles.statValue}>{formatCurrency(summary.totalAmount)}</div>
                                </div>
                            </div>

                            <div style={styles.statCard}>
                                <div style={styles.statContent}>
                                    <div style={styles.statLabel}>Total Expenses</div>
                                    <div style={styles.statValue}>{summary.totalCount}</div>
                                </div>
                            </div>

                            <div style={styles.statCard}>
                                <div style={styles.statContent}>
                                    <div style={styles.statLabel}>Average Amount</div>
                                    <div style={styles.statValue}>{formatCurrency(summary.averageAmount)}</div>
                                </div>
                            </div>

                        </div>

                        {/* Filter Section */}
                        <div style={styles.filterSection}>
                            <div style={styles.filterRow}>
                                <div style={styles.filterGroup}>
                                    <label style={styles.filterLabel}>Category</label>
                                    <select
                                        value={selectedCategoryId}
                                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                                        style={styles.filterSelect}
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div style={styles.filterGroup}>
                                    <label style={styles.filterLabel}>Month</label>
                                    <input
                                        type="month"
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        style={styles.filterInput}
                                        placeholder="YYYY-MM"
                                    />
                                </div>

                                <div style={styles.filterActions}>
                                    <button onClick={handleFilterChange} style={styles.applyButton}>
                                        Apply Filters
                                    </button>
                                    <button onClick={handleClearFilters} style={styles.clearButton}>
                                        Clear
                                    </button>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div style={styles.error}>
                                {error}
                                <button onClick={() => setError(null)} style={styles.closeError}>×</button>
                            </div>
                        )}

                        <div style={styles.chartsGrid}>
                            {/* Category Breakdown */}
                            <div style={styles.chartCard}>
                                <h2 style={styles.chartTitle}>Category Breakdown</h2>
                                {summary.categoryBreakdown.length === 0 ? (
                                    <div style={styles.noData}>No category data available</div>
                                ) : (
                                    <>
                                        <div style={styles.pieChartContainer}>
                                            {generatePieChart(summary.categoryBreakdown)}
                                        </div>
                                        <div style={styles.tableWrapper}>
                                            <table style={styles.table}>
                                                <thead>
                                                    <tr style={styles.tableHeaderRow}>
                                                        <th style={styles.tableHeader}>Category</th>
                                                        <th style={styles.tableHeader}>Total Amount</th>
                                                        <th style={styles.tableHeader}>Count</th>
                                                        <th style={styles.tableHeader}>Percentage</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {summary.categoryBreakdown.map((category, index) => (
                                                        <tr key={index} style={styles.tableRow}>
                                                            <td style={styles.tableCell}>
                                                                <div style={styles.categoryName}>{category.categoryName}</div>
                                                            </td>
                                                            <td style={styles.tableCell}>
                                                                <div style={styles.amountText}>
                                                                    {formatCurrency(category.totalAmount)}
                                                                </div>
                                                            </td>
                                                            <td style={styles.tableCell}>{category.count}</td>
                                                            <td style={styles.tableCell}>
                                                                <div style={styles.percentageContainer}>
                                                                    <div style={styles.percentageBar}>
                                                                        <div
                                                                            style={{
                                                                                ...styles.percentageFill,
                                                                                width: `${category.percentage}%`,
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <span style={styles.percentageText}>
                                                                        {category.percentage.toFixed(2)}%
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Monthly Breakdown */}
                            <div style={styles.chartCard}>
                                <h2 style={styles.chartTitle}>Monthly Breakdown</h2>
                                {summary.monthlyBreakdown.length === 0 ? (
                                    <div style={styles.noData}>No monthly data available</div>
                                ) : (
                                    <>
                                        {/* Bar Chart */}
                                        <div style={styles.barChartContainer}>
                                            {generateBarChart(summary.monthlyBreakdown)}
                                        </div>

                                        {/* Table */}
                                        <div style={styles.tableWrapper}>
                                            <table style={styles.table}>
                                                <thead>
                                                    <tr style={styles.tableHeaderRow}>
                                                        <th style={styles.tableHeader}>Month</th>
                                                        <th style={styles.tableHeader}>Total Amount</th>
                                                        <th style={styles.tableHeader}>Count</th>
                                                        <th style={styles.tableHeader}>Average</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {summary.monthlyBreakdown.map((month, index) => (
                                                        <tr key={index} style={styles.tableRow}>
                                                            <td style={styles.tableCell}>
                                                                <div style={styles.monthName}>{formatMonth(month.month)}</div>
                                                            </td>
                                                            <td style={styles.tableCell}>
                                                                <div style={styles.amountText}>
                                                                    {formatCurrency(month.totalAmount)}
                                                                </div>
                                                            </td>
                                                            <td style={styles.tableCell}>{month.count}</td>
                                                            <td style={styles.tableCell}>
                                                                {formatCurrency(month.totalAmount / month.count)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={styles.noData}>No data available</div>
                )}
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    ...commonStyles,
    refreshButton: {
        padding: "10px 20px",
        borderRadius: 6,
        border: "none",
        background: "#2563eb",
        color: "#fff",
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 500,
    },
    content: {
        maxWidth: 1400,
        margin: "0 auto",
    },
    error: {
        background: "#fee2e2",
        color: "#b91c1c",
        padding: "12px 16px",
        borderRadius: 8,
        marginBottom: 24,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    closeError: {
        background: "transparent",
        border: "none",
        color: "#b91c1c",
        cursor: "pointer",
        fontSize: 20,
        padding: 0,
        width: 24,
        height: 24,
    },
    loading: {
        textAlign: "center",
        padding: 40,
        fontSize: 16,
        color: "#6b7280",
    },
    noData: {
        textAlign: "center",
        padding: 40,
        fontSize: 16,
        color: "#6b7280",
    },
    cardButton: {
        padding: "10px 16px",
        borderRadius: 6,
        border: "none",
        background: "#2563eb",
        color: "#fff",
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 500,
    },
    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 24,
        marginBottom: 32,
    },
    statCard: {
        background: "#fff",
        padding: 24,
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(15,23,42,0.08)",
    },
    statContent: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
    },
    statLabel: {
        fontSize: 13,
        color: "#6b7280",
        marginBottom: 4,
        fontWeight: 500,
    },
    statValue: {
        fontSize: 28,
        fontWeight: 700,
        color: "#111827",
    },
    chartsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
        gap: 24,
    },
    chartCard: {
        background: "#fff",
        padding: 24,
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(15,23,42,0.08)",
    },
    chartTitle: {
        margin: 0,
        fontSize: 18,
        fontWeight: 600,
        color: "#111827",
    },
    pieChartContainer: {
        display: "flex",
        justifyContent: "center",
        padding: "20px 0",
    },
    tableWrapper: {
        overflow: "auto",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
    },
    tableHeaderRow: {
        background: "#f9fafb",
    },
    tableHeader: {
        padding: "12px 16px",
        textAlign: "left",
        fontSize: 13,
        fontWeight: 600,
        color: "#374151",
        borderBottom: "2px solid #e5e7eb",
    },
    tableRow: {
        borderBottom: "1px solid #e5e7eb",
    },
    tableCell: {
        padding: "16px",
        fontSize: 14,
        color: "#111827",
    },
    categoryName: {
        fontWeight: 500,
        color: "#111827",
    },
    monthName: {
        fontWeight: 500,
        color: "#111827",
    },
    amountText: {
        fontWeight: 600,
        color: "#059669",
    },
    percentageContainer: {
        display: "flex",
        alignItems: "center",
        gap: 12,
    },
    percentageBar: {
        flex: 1,
        height: 8,
        background: "#e5e7eb",
        borderRadius: 4,
        overflow: "hidden",
    },
    percentageFill: {
        height: "100%",
        background: "linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)",
        borderRadius: 4,
        transition: "width 0.3s ease",
    },
    percentageText: {
        fontSize: 13,
        fontWeight: 600,
        color: "#374151",
        minWidth: 55,
        textAlign: "right",
    },
    filterSection: {
        background: "#fff",
        padding: "20px 24px",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(15,23,42,0.08)",
        marginBottom: 24,
    },
    filterRow: {
        display: "flex",
        alignItems: "flex-end",
        gap: 16,
        flexWrap: "wrap",
    },
    filterGroup: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
        minWidth: 200,
    },
    filterLabel: {
        fontSize: 13,
        fontWeight: 500,
        color: "#374151",
    },
    filterSelect: {
        padding: "10px 12px",
        borderRadius: 6,
        border: "1px solid #d1d5db",
        fontSize: 14,
        color: "#111827",
        background: "#fff",
        cursor: "pointer",
        outline: "none",
    },
    filterInput: {
        padding: "10px 12px",
        borderRadius: 6,
        border: "1px solid #d1d5db",
        fontSize: 14,
        color: "#111827",
        background: "#fff",
        outline: "none",
    },
    filterActions: {
        display: "flex",
        gap: 12,
        alignItems: "center",
    },
    applyButton: {
        padding: "10px 20px",
        borderRadius: 6,
        border: "none",
        background: "#2563eb",
        color: "#fff",
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 500,
    },
    clearButton: {
        padding: "10px 20px",
        borderRadius: 6,
        border: "1px solid #d1d5db",
        background: "#fff",
        color: "#374151",
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 500,
    },
    barChartContainer: {
        overflowX: "auto",
        paddingTop: "20px",
    },
};

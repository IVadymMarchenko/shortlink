// src/components/LinkStatsModal/LinkStatsModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { X, BarChart2, Globe, Laptop, Calendar, Lock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import styles from './LinkStatsModal.module.css';
import api from '../../api';
import { useLang } from '../../context/LanguageContext';

const DOMAIN = import.meta.env.VITE_API_DOMAIN || window.location.host;

export default function LinkStatsModal({ link, onClose, userPlan, onNavigateToBilling }) {
    const { t, lang, currentLang } = useLang(); 
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);

    const activeLang = lang || currentLang || localStorage.getItem('cleanlink_lang') || 'uk';
    const isFreePlan = userPlan === 'free';

    useEffect(() => {
        if (!link?.id) return;
        document.body.style.overflow = 'hidden';

        const abortController = new AbortController();

        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/links/${link.id}/analytics/`, {
                    headers: { 'Accept-Language': activeLang },
                    signal: abortController.signal
                });
                setAnalyticsData(response.data);
            } catch (err) {
                if (err.name !== 'CanceledError') {
                    console.error("Error loading link analytics:", err);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
            abortController.abort();
        };
    }, [link, activeLang, onClose]);

    const stats = useMemo(() => {
        if (!analyticsData) return null;

        const clicks = analyticsData.analytics || [];
        const total = clicks.length;

        const txtLocal = t('dashboard.local');
        const txtPc = t('dashboard.pc');
        const txtMobile = t('dashboard.mobile');
        const txtNoData = t('dashboard.noData');

        const localeString = activeLang === 'uk' ? 'uk-UA' : 'en-US';
        const dateFormatter = new Intl.DateTimeFormat(localeString, { day: '2-digit', month: '2-digit' });

        const { countriesMap, devicesMap, timelineMap } = collectRawData(clicks, {
            txtLocal,
            txtPc,
            txtMobile,
            dateFormatter
        });

        const countryData = formatCountryData(countriesMap, total, styles);
        const deviceData = formatDeviceData(devicesMap, total, txtPc, txtMobile, styles);
        const dailyData = formatDailyTimeline(timelineMap, dateFormatter);

        return {
            totalClicks: analyticsData.clicks_count || total,
            uniqueClicks: analyticsData.unique_clicks_count || 0,
            topLocation: isFreePlan ? 'PRO 🚀' : (countryData[0] ? `${countryData[0].name} (${countryData[0].value}%)` : txtNoData),
            dailyData,
            countryData: countryData.length > 0 ? countryData : [{ name: txtNoData, value: 100, color: styles.chartEmpty }],
            deviceData
        };
    }, [analyticsData, activeLang, t, isFreePlan]);

    if (!link) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

                <div className={styles.header}>
                    <div className={styles.titleGroup}>
                        <BarChart2 className={styles.analyticsIcon} size={24} />
                        <div>
                            <h3>{t('dashboard.statsTitle')}</h3>
                            <p className={styles.linkName}>{DOMAIN}/{link.short_code}</p>
                        </div>
                    </div>
                    <button className={styles.btnClose} onClick={onClose} aria-label="Close modal"><X size={20} /></button>
                </div>

                {loading ? (
                    <div className={styles.loadingContainer}>
                        <h4>{t('dashboard.loadingAnalytics')}</h4>
                    </div>
                ) : stats ? (
                    <>
                        <div className={styles.widgetsGrid}>
                            <div className={styles.widgetCard}>
                                <span className={styles.widgetLabel}>{t('dashboard.totalClicks')}</span>
                                <span className={styles.widgetValue}>{stats.totalClicks}</span>
                            </div>
                            <div className={styles.widgetCard}>
                                <span className={styles.widgetLabel}>{t('dashboard.uniqueClicks')}</span>
                                <span className={styles.widgetValue}>{stats.uniqueClicks}</span>
                            </div>
                            <div className={styles.widgetCard}>
                                <span className={styles.widgetLabel}>{t('dashboard.topLocation')}</span>
                                <span className={`${styles.widgetValue} ${isFreePlan ? styles.lockedText : ''}`}>
                                    {stats.topLocation}
                                </span>
                            </div>
                        </div>

                        <div className={isFreePlan ? styles.blurContainer : ''}>
                            {isFreePlan && (
                                <div className={styles.paywallOverlay}>
                                    <div className={styles.paywallCard}>
                                        <Lock size={32} className={styles.lockIcon} />
                                        <h4>
                                            {t('dashboard.graphsLockedTitle') !== 'dashboard.graphsLockedTitle' 
                                                ? t('dashboard.graphsLockedTitle') 
                                                : (activeLang === 'uk' ? 'Детальна аналітика заблокована' : 'Detailed Analytics Locked')}
                                        </h4>
                                        <p>
                                            {t('dashboard.graphsLockedDesc') !== 'dashboard.graphsLockedDesc' 
                                                ? t('dashboard.graphsLockedDesc') 
                                                : (activeLang === 'uk' 
                                                    ? 'Перейдіть на PRO тариф, щоб бачити графіки, географію кліків та пристрої вашої аудиторії.' 
                                                    : 'Upgrade to PRO to view charts, click geography, and audience devices.')}
                                        </p>
                                        <button className={styles.btnUpgrade} onClick={onNavigateToBilling}>
                                            {t('dashboard.btnUpgrade') !== 'dashboard.btnUpgrade' 
                                                ? t('dashboard.btnUpgrade') 
                                                : (activeLang === 'uk' ? 'Оновити тариф 🚀' : 'Upgrade Plan 🚀')}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* График динамики */}
                            <div className={styles.chartSection}>
                                <h4>
                                    <Calendar size={16} /> 
                                    {t('dashboard.weeklyDynamics')}
                                </h4>
                                <div className={styles.mainChartContainer}>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <AreaChart data={stats.dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={styles.chartPrimary} stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor={styles.chartPrimary} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.2} />
                                            <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                                            <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} allowDecimals={false} />
                                            <Tooltip contentStyle={{}} wrapperClassName={styles.customTooltip} />
                                            <Area 
                                                type="monotone" 
                                                dataKey="clicks" 
                                                name={t('dashboard.clicks')} 
                                                stroke={styles.chartPrimary} 
                                                strokeWidth={3} 
                                                fillOpacity={1} 
                                                fill="url(#colorClicks)" 
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Круговые диаграммы */}
                            <div className={styles.bottomChartsGrid}>
                                <div className={styles.pieCard}>
                                    <h4><Globe size={16} /> {t('dashboard.topCountries')}</h4>
                                    <div className={styles.pieFlex}>
                                        <ResponsiveContainer width={100} height={100}>
                                            <PieChart>
                                                <Pie data={stats.countryData} cx="50%" cy="50%" innerRadius={30} outerRadius={45} paddingAngle={3} dataKey="value">
                                                    {stats.countryData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <ul className={styles.legend}>
                                            {stats.countryData.map((c, i) => (
                                                <li key={i}>
                                                    <span style={{ backgroundColor: c.color }} /> 
                                                    {c.name} {c.name !== t('dashboard.noData') && `(${c.value}%)`}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className={styles.pieCard}>
                                    <h4><Laptop size={16} /> {t('dashboard.devices')}</h4>
                                    <div className={styles.pieFlex}>
                                        <ResponsiveContainer width={100} height={100}>
                                            <PieChart>
                                                <Pie data={stats.deviceData} cx="50%" cy="50%" innerRadius={30} outerRadius={45} paddingAngle={3} dataKey="value">
                                                    {stats.deviceData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <ul className={styles.legend}>
                                            {stats.deviceData.map((d, i) => (
                                                <li key={i}>
                                                    <span style={{ backgroundColor: d.color }} /> 
                                                    {d.name} ({d.value}%)
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className={styles.noDataContainer}>
                        {t('dashboard.noData')}
                    </div>
                )}
            </div>
        </div>
    );
}

// ==========================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ==========================================
function collectRawData(clicks, { txtLocal, txtPc, txtMobile, dateFormatter }) {
    const countriesMap = {};
    const devicesMap = { [txtPc]: 0, [txtMobile]: 0 };
    const timelineMap = {};

    clicks.forEach(c => {
        let country = c.country || 'Other';
        if (country === 'Local/Unknown') country = txtLocal;
        countriesMap[country] = (countriesMap[country] || 0) + 1;

        const device = c.device_type === 'PC' ? txtPc : txtMobile;
        devicesMap[device] = (devicesMap[device] || 0) + 1;

        if (c.clicked_at) {
            try {
                const dateKey = dateFormatter.format(new Date(c.clicked_at));
                timelineMap[dateKey] = (timelineMap[dateKey] || 0) + 1;
            } catch (e) {}
        }
    });

    return { countriesMap, devicesMap, timelineMap };
}

function formatCountryData(countriesMap, total, styles) {
    const countryColors = [
        styles.chartPrimary,
        styles.chartColor2,
        styles.chartColor3,
        styles.chartColor4
    ];

    return Object.keys(countriesMap)
        .map((name, index) => ({
            name,
            value: total > 0 ? Math.round((countriesMap[name] / total) * 100) : 0,
            color: countryColors[index % countryColors.length]
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 4);
}

function formatDeviceData(devicesMap, total, txtPc, txtMobile, styles) {
    return [
        { 
            name: txtMobile, 
            value: total > 0 ? Math.round((devicesMap[txtMobile] / total) * 100) : 0, 
            color: styles.chartMobile 
        },
        { 
            name: txtPc, 
            value: total > 0 ? Math.round((devicesMap[txtPc] / total) * 100) : 0, 
            color: styles.chartPc 
        }
    ];
}

function formatDailyTimeline(timelineMap, dateFormatter) {
    const dailyData = Object.keys(timelineMap)
        .map(date => ({
            name: date,
            clicks: timelineMap[date]
        }))
        .slice(-7);

    if (dailyData.length === 0) {
        dailyData.push({ name: dateFormatter.format(new Date()), clicks: 0 });
    }

    return dailyData;
}
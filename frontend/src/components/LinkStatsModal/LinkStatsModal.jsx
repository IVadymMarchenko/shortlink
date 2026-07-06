import React, { useState, useEffect, useMemo } from 'react';
import { X, BarChart2, Globe, Laptop, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import styles from './LinkStatsModal.module.css';
import api from '../../api';
import { useLang } from '../../context/LanguageContext'; // Импортируем контекст языков

export default function LinkStatsModal({ link, onClose }) {
    const { t } = useLang(); // Инициализируем функцию t()
    const currentLang = localStorage.getItem('cleanlink_lang') || 'uk'; // Получаем текущий язык ('uk' или 'en')

    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Локальный словарь для динамических данных бэкенда
    const translations = {
        uk: {
            loading: "Завантаження аналітики...",
            noData: "Немає даних",
            clicks: "Кліки",
            pc: "ПК / Ноутбуки",
            mobile: "Смартфони",
            local: "Локальні / Невідомо",
            other: "Інші"
        },
        en: {
            loading: "Loading analytics...",
            noData: "No data",
            clicks: "Clicks",
            pc: "PC / Laptops",
            mobile: "Smartphones",
            local: "Local / Unknown",
            other: "Others"
        }
    };

    const localT = translations[currentLang] || translations['en'];

    // 1. Подгружаем реальные данные кликов с бэкенда Django
    useEffect(() => {
        if (!link?.id) return;

        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/links/${link.id}/analytics/`);
                setAnalyticsData(response.data);
            } catch (err) {
                console.error("Error loading link analytics:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [link]);

    // 2. Агрегируем сырые логи кликов для твоих Recharts-графиков
    const stats = useMemo(() => {
        if (!analyticsData) return null;

        const clicks = analyticsData.analytics || [];
        const total = clicks.length;

        const countriesMap = {};
        const devicesMap = {};
        const timelineMap = {};

        clicks.forEach(c => {
            // Перевод стран
            let country = c.country || 'Other';
            if (country === 'Local/Unknown') country = localT.local;
            countriesMap[country] = (countriesMap[country] || 0) + 1;

            // Перевод девайсов
            const device = c.device_type === 'PC' ? localT.pc : localT.mobile;
            devicesMap[device] = (devicesMap[device] || 0) + 1;

            // Динамика кликов (форматируем дату)
            if (c.clicked_at) {
                const dateKey = new Date(c.clicked_at).toLocaleDateString(currentLang === 'uk' ? 'uk-UA' : 'en-US', { day: '2-digit', month: '2-digit' });
                timelineMap[dateKey] = (timelineMap[dateKey] || 0) + 1;
            }
        });

        const countryColors = ['#6366f1', '#3b82f6', '#a855f7', '#64748b'];
        const countryData = Object.keys(countriesMap).map((name, index) => ({
            name,
            value: total > 0 ? Math.round((countriesMap[name] / total) * 100) : 0,
            color: countryColors[index % countryColors.length]
        })).sort((a, b) => b.value - a.value).slice(0, 4);

        const deviceData = [
            { name: localT.mobile, value: devicesMap[localT.mobile] ? Math.round((devicesMap[localT.mobile] / total) * 100) : 0, color: '#ec4899' },
            { name: localT.pc, value: devicesMap[localT.pc] ? Math.round((devicesMap[localT.pc] / total) * 100) : 0, color: '#0ea5e9' }
        ];

        const dailyData = Object.keys(timelineMap).map(date => ({
            name: date,
            clicks: timelineMap[date]
        })).slice(-7);

        if (dailyData.length === 0) {
            dailyData.push({ name: new Date().toLocaleDateString(currentLang === 'uk' ? 'uk-UA' : 'en-US', { day: '2-digit', month: '2-digit' }), clicks: 0 });
        }

        return {
            totalClicks: analyticsData.clicks_count || total,
            uniqueClicks: analyticsData.unique_clicks_count || 0,
            topLocation: countryData[0] ? `${countryData[0].name} (${countryData[0].value}%)` : localT.noData,
            dailyData,
            countryData: countryData.length > 0 ? countryData : [{ name: localT.noData, value: 100, color: '#e2e8f0' }],
            deviceData: total > 0 ? deviceData : [
                { name: localT.mobile, value: 0, color: '#ec4899' },
                { name: localT.pc, value: 0, color: '#0ea5e9' }
            ]
        };
    }, [analyticsData, localT, currentLang]);

    if (!link) return null;

    const domain = "127.0.0.1:8000";

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

                {/* Шапка модалки */}
                <div className={styles.header}>
                    <div className={styles.titleGroup}>
                        <BarChart2 className={styles.analyticsIcon} size={24} />
                        <div>
                            {/* Если ключи в твоем i18n отличаются, замени 'dashboard.statsTitle' на свои */}
                            <h3>{currentLang === 'uk' ? 'Статистика посилання' : 'Link Statistics'}</h3>
                            <p className={styles.linkName}>{domain}/{link.short_code}</p>
                        </div>
                    </div>
                    <button className={styles.btnClose} onClick={onClose}><X size={20} /></button>
                </div>

                {loading ? (
                    <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <h4>{localT.loading}</h4>
                    </div>
                ) : stats ? (
                    <>
                        {/* Сетка виджетов (мини-карточки) */}
                        <div className={styles.widgetsGrid}>
                            <div className={styles.widgetCard}>
                                <span className={styles.widgetLabel}>{currentLang === 'uk' ? 'Всього переходів' : 'Total Clicks'}</span>
                                <span className={styles.widgetValue}>{stats.totalClicks}</span>
                            </div>
                            <div className={styles.widgetCard}>
                                <span className={styles.widgetLabel}>{currentLang === 'uk' ? 'Унікальні кліки' : 'Unique Clicks'}</span>
                                <span className={styles.widgetValue}>{stats.uniqueClicks}</span>
                            </div>
                            <div className={styles.widgetCard}>
                                <span className={styles.widgetLabel}>{currentLang === 'uk' ? 'Топ локація' : 'Top Location'}</span>
                                <span className={styles.widgetValue}>{stats.topLocation}</span>
                            </div>
                        </div>

                        {/* Главный график динамики кликов */}
                        <div className={styles.chartSection}>
                            <h4><Calendar size={16} /> {currentLang === 'uk' ? 'Динаміка кліків за тиждень' : 'Click Dynamics for the Week'}</h4>
                            <div className={styles.mainChartContainer}>
                                <ResponsiveContainer width="100%" height={220}>
                                    <AreaChart data={stats.dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.2} />
                                        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                                        <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} allowDecimals={false} />
                                        <Tooltip
                                            contentStyle={{
                                                background: 'var(--body-bg, #fff)',
                                                border: '1px solid var(--border-color, #e2e8f0)',
                                                borderRadius: '8px',
                                                color: 'var(--text-main, #000)'
                                            }}
                                        />
                                        <Area type="monotone" dataKey="clicks" name={localT.clicks} stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Нижние круговые диаграммы */}
                        <div className={styles.bottomChartsGrid}>
                            {/* Гео */}
                            <div className={styles.pieCard}>
                                <h4><Globe size={16} /> {currentLang === 'uk' ? 'Топ країн' : 'Top Countries'}</h4>
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
                                                <span style={{ backgroundColor: c.color }} /> {c.name} {c.name !== localT.noData && `(${c.value}%)`}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Устройства */}
                            <div className={styles.pieCard}>
                                <h4><Laptop size={16} /> {currentLang === 'uk' ? 'Пристрої' : 'Devices'}</h4>
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
                                            <li key={i}><span style={{ backgroundColor: d.color }} /> {d.name} ({d.value}%)</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.7 }}>{localT.noData}</div>
                )}
            </div>
        </div>
    );
}
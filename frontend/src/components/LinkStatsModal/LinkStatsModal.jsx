import React from 'react';
import { X, BarChart2, Globe, Laptop, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import styles from './LinkStatsModal.module.css';

export default function LinkStatsModal({ link, onClose }) {
    if (!link) return null;

    // Имитируем данные, которые прилетят от Django API для конкретной ссылки
    const dailyData = [
        { name: '20.06', clicks: 12 },
        { name: '21.06', clicks: 18 },
        { name: '22.06', clicks: 45 },
        { name: '23.06', clicks: 30 },
        { name: '24.06', clicks: 65 },
        { name: '25.06', clicks: 82 },
        { name: '26.06', clicks: link.clicks_count || 95 }, // Привяжем к реальному счетчику
    ];

    const countryData = [
        { name: 'Украина', value: 60, color: '#6366f1' },
        { name: 'Польша', value: 20, color: '#3b82f6' },
        { name: 'США', value: 15, color: '#a855f7' },
        { name: 'Другие', value: 5, color: '#64748b' },
    ];

    const deviceData = [
        { name: 'Смартфоны', value: 70, color: '#ec4899' },
        { name: 'ПК / Ноутбуки', value: 30, color: '#0ea5e9' },
    ];

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

                {/* Шапка модалки */}
                <div className={styles.header}>
                    <div className={styles.titleGroup}>
                        <BarChart2 className={styles.analyticsIcon} size={24} />
                        <div>
                            <h3>Статистика ссылки</h3>
                            <p className={styles.linkName}>{link.custom_domain}/{link.short_slug}</p>
                        </div>
                    </div>
                    <button className={styles.btnClose} onClick={onClose}><X size={20} /></button>
                </div>

                {/* Сетка виджетов (мини-карточки) */}
                <div className={styles.widgetsGrid}>
                    <div className={styles.widgetCard}>
                        <span className={styles.widgetLabel}>Всего переходов</span>
                        <span className={styles.widgetValue}>{link.clicks_count}</span>
                    </div>
                    <div className={styles.widgetCard}>
                        <span className={styles.widgetLabel}>Уникальные клики</span>
                        {/* Имитируем уникальные: 80% от общего числа, минимум 0 */}
                        <span className={styles.widgetValue}>
                            {Math.round(link.clicks_count * 0.8)}
                        </span>
                    </div>
                    <div className={styles.widgetCard}>
                        <span className={styles.widgetLabel}>Топ локация</span>
                        <span className={styles.widgetValue}>Украина (60%)</span>
                    </div>
                </div>

                {/* Главный график динамики кликов */}
                <div className={styles.chartSection}>
                    <h4><Calendar size={16} /> Динамика кликов за неделю</h4>
                    <div className={styles.mainChartContainer}>
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.2} />
                                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--body-bg)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        color: 'var(--text-main)'
                                    }}
                                />
                                <Area type="monotone" dataKey="clicks" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Нижние круговые диаграммы */}
                <div className={styles.bottomChartsGrid}>
                    {/* Гео */}
                    <div className={styles.pieCard}>
                        <h4><Globe size={16} /> Топ стран</h4>
                        <div className={styles.pieFlex}>
                            <ResponsiveContainer width={100} height={100}>
                                <PieChart>
                                    <Pie data={countryData} cx="50%" cy="50%" innerRadius={30} outerRadius={45} paddingAngle={3} dataKey="value">
                                        {countryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <ul className={styles.legend}>
                                {countryData.map((c, i) => (
                                    <li key={i}><span style={{ backgroundColor: c.color }} /> {c.name} ({c.value}%)</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Устройства */}
                    <div className={styles.pieCard}>
                        <h4><Laptop size={16} /> Устройства</h4>
                        <div className={styles.pieFlex}>
                            <ResponsiveContainer width={100} height={100}>
                                <PieChart>
                                    <Pie data={deviceData} cx="50%" cy="50%" innerRadius={30} outerRadius={45} paddingAngle={3} dataKey="value">
                                        {deviceData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <ul className={styles.legend}>
                                {deviceData.map((d, i) => (
                                    <li key={i}><span style={{ backgroundColor: d.color }} /> {d.name} ({d.value}%)</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
// src/pages/Dashboard/Dashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom'; // <--- Импортируем хук роутера
import styles from './Dashboard.module.css';
import Sidebar from '../../components/Sidebar/Sidebar';
import Pricing from '../../components/Pricing/Pricing';
import LinkStatsModal from '../../components/LinkStatsModal/LinkStatsModal';
import { useDashboard } from './useDashboard';

import UserWelcomeCard from './components/UserWelcomeCard';
import CreateLinkForm from './components/CreateLinkForm';
import LinksFilterControls from './components/LinksFilterControls';
import LinksList from './components/LinksList';

export default function Dashboard({ onLogout, user }) {
  
  const userPlanPrice = user && user.plan ? parseFloat(user.plan.price) : 0;
  const isCustomSlugAllowed = user && user.plan_slug && user.plan_slug.toLowerCase() !== 'free';
  console.log("ДАННЫЕ ПОЛЬЗОВАТЕЛЯ:", user);
  console.log("РАЗРЕШЕН ЛИ СЛАГ:", user && user.plan ? parseFloat(user.plan.price) > 0 : false);
  const navigate = useNavigate();

  const {
    activeTab,
    userPlan,
    isLoading,
    longUrl,
    setLongUrl,
    customSlug,
    handleSlugChange,
    errors,
    setErrors,
    generatedLink,
    isCopied,
    copiedLinkId,
    searchQuery,
    sortBy,
    setSortBy,
    visibleCount,
    setVisibleCount,
    activeStatsLink,
    setActiveStatsLink,
    filteredAndSortedLinks,
    handlePlanPurchase,
    handleSubmit,
    handleDelete,
    handleCopyGenerated,
    handleCopyExisting,
    handleSearchChange,
    shortLinkDomain,
  } = useDashboard(user);

  return (
    <div className={styles.layout}>
      <Sidebar onLogout={onLogout} />

      <main className={styles.mainContent}>
        {/* ВКЛАДКА ССЫЛОК */}
        {activeTab === 'links' && (
          <>
            <UserWelcomeCard user={user} userPlan={userPlan} styles={styles} />

            <CreateLinkForm
              handleSubmit={handleSubmit}
              longUrl={longUrl}
              setLongUrl={setLongUrl}
              errors={errors}
              setErrors={setErrors}
              customSlug={customSlug}
              handleSlugChange={handleSlugChange}
              userPlan={userPlan}
              generatedLink={generatedLink}
              isCopied={isCopied}
              handleCopyGenerated={handleCopyGenerated}
              styles={styles}
              isCustomSlugAllowed={isCustomSlugAllowed}
            />

            <LinksFilterControls
              searchQuery={searchQuery}
              handleSearchChange={handleSearchChange}
              sortBy={sortBy}
              setSortBy={setSortBy}
              setVisibleCount={setVisibleCount}
              styles={styles}
            />

            {isLoading ? (
              <div className={styles.loader}>Loading links...</div>
            ) : (
              <LinksList
                filteredAndSortedLinks={filteredAndSortedLinks}
                visibleCount={visibleCount}
                setVisibleCount={setVisibleCount}
                copiedLinkId={copiedLinkId}
                handleCopyExisting={handleCopyExisting}
                setActiveStatsLink={setActiveStatsLink}
                handleDelete={handleDelete}
                styles={styles}
                shortLinkDomain={shortLinkDomain}
              />
            )}
          </>
        )}

        {/* ВКЛАДКА БИЛЛИНГА */}
        {activeTab === 'billing' && (
          <Pricing onPurchase={handlePlanPurchase} currentPlanSlug={userPlan} />
        )}

        {/* ПЕРЕДАЕМ ЧИСТУЮ НАВИГАЦИЮ В МОДАЛКУ */}
        {activeStatsLink && (
          <LinkStatsModal 
            link={activeStatsLink} 
            onClose={() => setActiveStatsLink(null)} 
            userPlan={userPlan} 
            onNavigateToBilling={() => {
              setActiveStatsLink(null); 
              navigate('/billing');     
            }}
          />
        )}
      </main>
    </div>
  );
}
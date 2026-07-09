import React from 'react';
import styles from './Dashboard.module.css';
import Sidebar from '../../components/Sidebar/Sidebar';
import Pricing from '../../components/Pricing/Pricing';
import LinkStatsModal from '../../components/LinkStatsModal/LinkStatsModal';

// Импорт кастомного хука бизнес-логики (лежит в этой же папке)
import { useDashboard } from './useDashboard';

// Импорт декомпозированных UI компонентов из новой подпапки components
import UserWelcomeCard from './components/UserWelcomeCard';
import CreateLinkForm from './components/CreateLinkForm';
import LinksFilterControls from './components/LinksFilterControls';
import LinksList from './components/LinksList';

export default function Dashboard({ onLogout, user, initialTab = 'links' }) {
  const {
    currentLang,
    activeTab,
    userPlan,
    longUrl,
    setLongUrl,
    customSlug,
    setCustomSlug,
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
    handleTabChange,
    handleSubmit,
    handleDelete,
    handleCopyGenerated,
    handleCopyExisting,
    handleSearchChange,
  } = useDashboard(user, initialTab);

  return (
    <div className={styles.layout}>
      <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} onLogout={onLogout} />

      <main className={styles.mainContent}>
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
              setCustomSlug={setCustomSlug}
              userPlan={userPlan}
              handleTabChange={handleTabChange}
              generatedLink={generatedLink}
              isCopied={isCopied}
              handleCopyGenerated={handleCopyGenerated}
              currentLang={currentLang}
              styles={styles}
            />

            <LinksFilterControls
              searchQuery={searchQuery}
              handleSearchChange={handleSearchChange}
              sortBy={sortBy}
              setSortBy={setSortBy}
              setVisibleCount={setVisibleCount}
              styles={styles}
            />

            <LinksList
              filteredAndSortedLinks={filteredAndSortedLinks}
              visibleCount={visibleCount}
              setVisibleCount={setVisibleCount}
              copiedLinkId={copiedLinkId}
              handleCopyExisting={handleCopyExisting}
              setActiveStatsLink={setActiveStatsLink}
              handleDelete={handleDelete}
              currentLang={currentLang}
              styles={styles}
            />
          </>
        )}

        {activeTab === 'billing' && (
          <Pricing onPurchase={handlePlanPurchase} currentPlanSlug={user?.plan_name} />
        )}

        {activeStatsLink && (
          <LinkStatsModal link={activeStatsLink} onClose={() => setActiveStatsLink(null)} />
        )}
      </main>
    </div>
  );
}
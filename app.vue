<template>
  <div class="app-layout">
    <!-- Editorial Header with Navigation -->
    <AppHeader 
      :active-tab="activeTab" 
      :is-admin-authenticated="isAdminAuthenticated"
      @change-tab="handleTabChange"
      @request-admin-access="handleAdminClick"
    />

    <main class="main-content">
      <!-- Overall Season Leaderboard -->
      <div v-if="activeTab === 'overall'">
        <LeaderboardTable 
          title="OVERALL SEASON LEADERBOARD"
          subtitle="Cumulative standings across EthChess Tuesday and Freestyle Friday tournaments"
          :rows="overallStandings"
          @select-player="selectedPlayer = $event"
        />
      </div>

      <!-- Tuesday League Leaderboard -->
      <div v-if="activeTab === 'tuesday'">
        <LeaderboardTable 
          title="ETHCHESS TUESDAY LEADERBOARD"
          subtitle="Standings for weekly Tuesday 9-Round Swiss tournaments"
          :rows="tuesdayStandings"
          @select-player="selectedPlayer = $event"
        />
      </div>

      <!-- Friday Freestyle Leaderboard -->
      <div v-if="activeTab === 'friday'">
        <LeaderboardTable 
          title="FREESTYLE FRIDAY LEADERBOARD"
          subtitle="Standings for weekly Friday 9-Round Swiss tournaments"
          :rows="fridayStandings"
          @select-player="selectedPlayer = $event"
        />
      </div>

      <!-- Scoring Rules & Guide -->
      <div v-if="activeTab === 'rules'">
        <ScoringRulesModal />
      </div>

      <!-- Protected Admin Portal (Sync & Roster Importer) -->
      <div v-if="activeTab === 'admin' && isAdminAuthenticated" class="admin-portal">
        <div class="admin-header-bar">
          <div>
            <h2 class="editorial-title">ADMIN MANAGEMENT PORTAL</h2>
            <p class="admin-sub">Authorized portal for seeding player rosters and syncing Chess.com public tournament results</p>
          </div>
          <button class="btn-secondary" @click="handleLogout">
            LOGOUT ADMIN
          </button>
        </div>

        <TournamentSync @tournament-synced="refreshAllData" />
        <RosterImporter @roster-updated="refreshAllData" />
      </div>
    </main>

    <!-- Admin Login Modal Dialog -->
    <AdminLoginModal 
      :is-open="showLoginModal" 
      @close="showLoginModal = false"
      @authenticated="onAdminAuthenticated"
    />

    <!-- Player Performance Breakdown Modal -->
    <PlayerDetailModal 
      :player="selectedPlayer" 
      @close="selectedPlayer = null" 
    />

    <!-- Minimalist Editorial Footer -->
    <footer class="app-footer">
      <div class="footer-content">
        <p class="footer-text">
          THE ETHCHESS LEAGUE &copy; 2026. BUILT WITH NUXT 4, VUE 3, TURSO LIBSQL & CHESS.COM PUBLIC API.
        </p>
        <span class="motto-footer">PLAY. ENJOY. REPEAT.</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AppHeader from '~/components/AppHeader.vue';
import LeaderboardTable from '~/components/LeaderboardTable.vue';
import ScoringRulesModal from '~/components/ScoringRulesModal.vue';
import RosterImporter from '~/components/RosterImporter.vue';
import TournamentSync from '~/components/TournamentSync.vue';
import PlayerDetailModal from '~/components/PlayerDetailModal.vue';
import AdminLoginModal from '~/components/AdminLoginModal.vue';

const activeTab = ref('overall');
const selectedPlayer = ref(null);
const isAdminAuthenticated = ref(false);
const showLoginModal = ref(false);

const overallStandings = ref([]);
const tuesdayStandings = ref([]);
const fridayStandings = ref([]);

const checkAdminSession = async () => {
  try {
    const res = await $fetch('/api/auth/session');
    isAdminAuthenticated.value = res.authenticated || false;
  } catch (err) {
    isAdminAuthenticated.value = false;
  }
};

const handleTabChange = (tab) => {
  if (tab === 'admin' && !isAdminAuthenticated.value) {
    showLoginModal.value = true;
    return;
  }
  activeTab.value = tab;
};

const handleAdminClick = () => {
  if (isAdminAuthenticated.value) {
    activeTab.value = 'admin';
  } else {
    showLoginModal.value = true;
  }
};

const onAdminAuthenticated = () => {
  isAdminAuthenticated.value = true;
  activeTab.value = 'admin';
};

const handleLogout = async () => {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' });
  } finally {
    isAdminAuthenticated.value = false;
    activeTab.value = 'overall';
  }
};

const fetchStandings = async (type) => {
  try {
    const res = await $fetch(`/api/leaderboard?type=${type}`);
    return res.data || [];
  } catch (err) {
    console.error(`Failed to load ${type} standings:`, err);
    return [];
  }
};

const refreshAllData = async () => {
  overallStandings.value = await fetchStandings('all');
  tuesdayStandings.value = await fetchStandings('tuesday');
  fridayStandings.value = await fetchStandings('friday');
};

onMounted(() => {
  checkAdminSession();
  refreshAllData();
});
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  max-width: 1200px;
  width: 100%;
  margin: 32px auto;
  padding: 0 20px;
  flex: 1;
}

.admin-portal {
  margin-bottom: 40px;
}

.admin-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--color-dark);
  gap: 20px;
}

.admin-sub {
  font-size: 0.88rem;
  color: var(--color-dark-muted);
  margin-top: 4px;
}

.app-footer {
  background: #FFFFFF;
  border-top: 2px solid var(--color-dark);
  padding: 24px 20px;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.footer-text {
  font-family: var(--font-title);
  font-size: 0.72rem;
  color: var(--color-dark-muted);
}

.motto-footer {
  font-family: var(--font-title);
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--color-jade);
  letter-spacing: 0.1em;
}
</style>

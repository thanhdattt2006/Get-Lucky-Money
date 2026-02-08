/**
 * Admin Terminal Logic
 * Refactored for stability and clean state management
 */

const CONFIG = {
  API_URL: 'https://68edcae6df2025af780116cf.mockapi.io/luckyMoney',
  PASS: '123456Abcxyz',
};

const adminApp = {
  state: {
    allData: [],
    filteredData: [],
    isLoading: false,
  },

  async init() {
    lucide.createIcons();
    const isAuth = await this.authenticate();
    if (isAuth) {
      await this.loadData();
    }
  },

  async authenticate() {
    const { value: password } = await Swal.fire({
      title: 'SYSTEM AUTHENTICATION',
      input: 'password',
      inputPlaceholder: 'Enter Admin Credential',
      background: '#161922',
      color: '#c0caf5',
      confirmButtonColor: '#7aa2f7',
      allowOutsideClick: false,
    });

    if (password === CONFIG.PASS) return true;

    await Swal.fire({
      icon: 'error',
      title: 'ACCESS DENIED',
      background: '#161922',
      color: '#f7768e',
    });
    window.location.href = 'index.html';
    return false;
  },

  async loadData() {
    this.setLoading(true);
    try {
      const response = await fetch(CONFIG.API_URL);
      if (!response.ok) throw new Error('Network response failed');

      const data = await response.json();
      // Sort by latest ID
      this.state.allData = data.sort((a, b) => parseInt(b.id) - parseInt(a.id));
      this.handleFilter(); // Default render
    } catch (error) {
      console.error('Fetch Error:', error);
      this.notify('Failed to sync with database', 'error');
    } finally {
      this.setLoading(false);
    }
  },

  render() {
    const tbody = document.getElementById('admin-list');
    const totalEl = document.getElementById('admin-total');
    const countEl = document.getElementById('count-users');

    let totalMoney = 0;

    if (this.state.filteredData.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center" style="padding: 3rem; color: var(--text-dim)">// NO DATA STREAM DETECTED</td></tr>`;
    } else {
      tbody.innerHTML = this.state.filteredData
        .map((item) => {
          const amount = parseInt(item.money) || 0;
          totalMoney += amount;
          return `
                    <tr>
                        <td style="font-family: 'JetBrains Mono'; color: var(--text-dim)">#${item.id}</td>
                        <td style="font-weight: 600">${item.name}</td>
                        <td style="font-family: 'JetBrains Mono'; color: var(--accent-green)">${amount.toLocaleString()} VND</td>
                        <td class="text-right">
                            <button class="btn-del-mini" onclick="adminApp.deleteOne('${item.id}')">
                                <i data-lucide="trash"></i> DELETE
                            </button>
                        </td>
                    </tr>
                `;
        })
        .join('');
    }

    totalEl.innerText = `${totalMoney.toLocaleString()} VND`;
    countEl.innerText = this.state.filteredData.length;
    lucide.createIcons(); // Re-render icons for new rows
  },

  handleFilter() {
    const val = document.getElementById('filter-money').value;
    this.state.filteredData =
      val === 'all'
        ? [...this.state.allData]
        : this.state.allData.filter((i) => parseInt(i.money) === parseInt(val));
    this.render();
  },

  async deleteOne(id) {
    const res = await Swal.fire({
      title: 'Confirm Deletion?',
      text: `Entry #${id} will be permanently purged.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f7768e',
      background: '#161922',
      color: '#c0caf5',
    });

    if (res.isConfirmed) {
      try {
        const response = await fetch(`${CONFIG.API_URL}/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          this.state.allData = this.state.allData.filter((i) => i.id !== id);
          this.handleFilter();
          this.notify('Entry deleted successfully');
        }
      } catch (e) {
        this.notify('Delete operation failed', 'error');
      }
    }
  },

  async deleteAll() {
    const res = await Swal.fire({
      title: 'CRITICAL WARNING',
      text: 'ALL DATA WILL BE WIPED. ARE YOU ABSOLUTELY SURE?',
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'YES, PURGE EVERYTHING',
      confirmButtonColor: '#f7768e',
      background: '#161922',
      color: '#c0caf5',
    });

    if (res.isConfirmed) {
      Swal.fire({
        title: 'Wiping...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      try {
        // MockAPI doesn't support bulk delete, use Promise.all
        const promises = this.state.allData.map((item) =>
          fetch(`${CONFIG.API_URL}/${item.id}`, { method: 'DELETE' }),
        );
        await Promise.all(promises);
        await this.loadData();
        Swal.fire('CLEANED', 'System storage has been reset.', 'success');
      } catch (e) {
        this.notify('Bulk delete failed', 'error');
      }
    }
  },

  setLoading(status) {
    this.state.isLoading = status;
    const btn = document.querySelector('.nav-item i[data-lucide="refresh-cw"]');
    if (status) btn?.parentElement.classList.add('loading-spin');
    else btn?.parentElement.classList.remove('loading-spin');
  },

  notify(msg, icon = 'success') {
    Swal.fire({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      icon: icon,
      title: msg,
      background: '#161922',
      color: '#c0caf5',
    });
  },
};

window.onload = () => adminApp.init();

const API_URL = 'https://68edcae6df2025af780116cf.mockapi.io/luckyMoney';

const adminApp = {
  rawData: [],

  async init() {
    // Chặn cửa bằng password
    const { value: password } = await Swal.fire({
      title: 'Admin Access',
      input: 'password',
      inputPlaceholder: 'Nhập mật khẩu',
      background: '#fff',
      confirmButtonColor: '#c62828',
      allowOutsideClick: false,
      allowEscapeKey: false,
    });

    if (password === '123456Abcxyz') {
      this.loadData();
    } else {
      Swal.fire('Sai pass!', 'Biến đi!', 'error').then(() => {
        window.location.href = 'index.html'; // Đuổi về trang chủ
      });
    }
  },

  async loadData() {
    const tbody = document.getElementById('admin-list');
    tbody.innerHTML = '<tr><td colspan="4">Đang tải...</td></tr>';

    try {
      const res = await fetch(API_URL);
      this.rawData = await res.json();
      // Mặc định sort mới nhất lên đầu
      this.rawData.sort((a, b) => parseInt(b.id) - parseInt(a.id));
      this.renderTable(this.rawData);
    } catch (e) {
      console.error(e);
      tbody.innerHTML = '<tr><td colspan="4">Lỗi tải dữ liệu</td></tr>';
    }
  },

  renderTable(data) {
    const tbody = document.getElementById('admin-list');
    const totalEl = document.getElementById('admin-total');

    let total = 0;
    let html = '';

    if (data.length === 0) {
      html = '<tr><td colspan="4">Chưa có dữ liệu</td></tr>';
    } else {
      data.forEach((u) => {
        const m = parseInt(u.money) || 0;
        total += m;
        html += `
          <tr>
            <td>${u.id}</td>
            <td>${u.name}</td>
            <td style="color: var(--gold); font-weight:bold">${m.toLocaleString()}đ</td>
            <td>
              <button class="btn-delete-one" onclick="adminApp.deleteOne('${u.id}')">Xoá</button>
            </td>
          </tr>
        `;
      });
    }

    tbody.innerHTML = html;
    totalEl.innerHTML = `Tổng thu: ${total.toLocaleString()} VNĐ`;
  },

  // Lọc theo số tiền
  filterData() {
    const filterVal = document.getElementById('filter-money').value;
    if (filterVal === 'all') {
      this.renderTable(this.rawData);
    } else {
      const filtered = this.rawData.filter(
        (u) => parseInt(u.money) === parseInt(filterVal),
      );
      this.renderTable(filtered);
    }
  },

  // Xoá 1 người
  async deleteOne(id) {
    const confirm = await Swal.fire({
      title: 'Xoá người này?',
      text: 'Không hoàn tác được đâu!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Xoá luôn',
    });

    if (confirm.isConfirmed) {
      try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        // Xoá xong thì load lại data
        await this.loadData();
        Swal.fire('Đã xoá!', '', 'success');
      } catch (e) {
        Swal.fire('Lỗi', 'Không xoá được', 'error');
      }
    }
  },

  // Xoá HẾT (Nguy hiểm)
  async deleteAll() {
    const confirm = await Swal.fire({
      title: 'XOÁ SẠCH DỮ LIỆU?',
      text: 'Mày chắc chưa? Mất hết tiền đấy!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Tao chắc chắn!',
    });

    if (confirm.isConfirmed) {
      // MockAPI không hỗ trợ xoá bulk (1 phát hết luôn), nên phải loop xoá từng thằng.
      // Hơi lâu tí nếu data nhiều.
      Swal.fire({ title: 'Đang xoá...', didOpen: () => Swal.showLoading() });

      try {
        // Lấy danh sách ID hiện tại
        const deletePromises = this.rawData.map((u) =>
          fetch(`${API_URL}/${u.id}`, { method: 'DELETE' }),
        );

        await Promise.all(deletePromises);

        await this.loadData();
        Swal.fire('Sạch bách!', 'Đã reset server.', 'success');
      } catch (e) {
        Swal.fire('Lỗi', 'Có lỗi khi xoá hàng loạt', 'error');
      }
    }
  },
};

window.onload = () => adminApp.init();

window.addEventListener('load', () => {
  if (typeof adminApp !== 'undefined') {
    // Render Table
    adminApp.renderTable = function (data) {
      const tbody = document.getElementById('admin-list');
      const totalEl = document.getElementById('admin-total');

      let total = 0;
      let html = '';

      if (data.length === 0) {
        html =
          '<tr><td colspan="4" style="text-align:center; padding: 40px; color: var(--tn-comment); font-family: var(--font-code);">// NO DATA FOUND</td></tr>';
      } else {
        data.forEach((u) => {
          const m = parseInt(u.money) || 0;
          total += m;
          html += `
                  <tr>
                    <td class="id-col">#${u.id}</td>
                    <td class="name-col">${u.name}</td>
                    <td class="money-col">${m.toLocaleString()}</td>
                    <td>
                      <button class="btn-del" onclick="adminApp.deleteOne('${u.id}')">[DEL]</button>
                    </td>
                  </tr>
                `;
        });
      }

      tbody.innerHTML = html;
      totalEl.innerHTML = `${total.toLocaleString()} VND`;
    };

    // Override Delete All
    const oldDeleteAll = adminApp.deleteAll;
    adminApp.deleteAll = async function () {
      const confirm = await Swal.fire({
        title: 'SYSTEM WARNING',
        text: 'PERMANENTLY DELETE ALL DATA? THIS CANNOT BE UNDONE.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f7768e',
        cancelButtonColor: '#414868',
        confirmButtonText: 'CONFIRM DELETE',
        cancelButtonText: 'CANCEL',
        background: '#1a1b26',
        color: '#c0caf5',
      });

      if (confirm.isConfirmed) {
        Swal.fire({
          title: 'PROCESSING...',
          background: '#1a1b26',
          color: '#7aa2f7',
          showConfirmButton: false,
          didOpen: () => Swal.showLoading(),
        });

        try {
          const deletePromises = this.rawData.map((u) =>
            fetch(`${API_URL}/${u.id}`, { method: 'DELETE' }),
          );
          await Promise.all(deletePromises);

          await this.loadData();
          Swal.fire({
            title: 'SUCCESS',
            text: 'All data has been wiped.',
            icon: 'success',
            background: '#1a1b26',
            color: '#9ece6a',
            confirmButtonColor: '#7aa2f7',
          });
        } catch (e) {
          Swal.fire('ERROR', 'Failed to delete data.', 'error');
        }
      }
    };
  }
});

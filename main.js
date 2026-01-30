const API_URL = 'https://68edcae6df2025af780116cf.mockapi.io/luckyMoney';

const CONFIG = {
  slices: [
    { v: 10000, l: '10K' }, // 0
    { v: 200000, l: '200K' }, // 1
    { v: 10000, l: '10K' }, // 2
    { v: 200000, l: '200K' }, // 3
    { v: 10000, l: '10K' }, // 4
    { v: 500000, l: '500K' }, // 5 (Giải to)
    { v: 10000, l: '10K' }, // 6
    { v: 200000, l: '200K' }, // 7
    { v: 100000, l: '100K' }, // 8
    { v: 10000, l: '10K' }, // 9
  ],
  colors: ['#c62828', '#ffd700'],
  textColors: ['#fff', '#c62828'],
};

const app = {
  user: null,
  canvas: document.getElementById('wheel'),
  ctx: document.getElementById('wheel').getContext('2d'),
  rotation: 0,
  audio: document.getElementById('bg-music'),

  // Init: Cố gắng phát nhạc khi load
  init() {
    this.canvas = document.getElementById('wheel');
    this.ctx = this.canvas.getContext('2d');

    this.audio.volume = 0.6;

    // --- HACK AUTOPLAY ---
    // Tạo hàm kích hoạt nhạc
    const enableAudio = () => {
      this.audio.play().catch(() => {}); // Kệ mẹ lỗi nếu có
      // Chạy xong 1 lần thì gỡ event ra ngay cho đỡ rác bộ nhớ
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('touchstart', enableAudio);
      document.removeEventListener('keydown', enableAudio);
    };

    // Bắt dính mọi thao tác của user (chuột, chạm màn hình, gõ phím)
    document.addEventListener('click', enableAudio);
    document.addEventListener('touchstart', enableAudio); // Cho điện thoại
    document.addEventListener('keydown', enableAudio);
  },

  drawWheel() {
    const arc = (2 * Math.PI) / CONFIG.slices.length;
    const ctx = this.ctx;
    CONFIG.slices.forEach((item, i) => {
      const angle = i * arc;
      ctx.beginPath();
      ctx.fillStyle = CONFIG.colors[i % 2];
      ctx.moveTo(200, 200);
      ctx.arc(200, 200, 200, angle, angle + arc);
      ctx.lineTo(200, 200);
      ctx.fill();

      ctx.save();
      ctx.translate(200, 200);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = CONFIG.textColors[i % 2];
      ctx.font = 'bold 24px Inter';
      ctx.fillText(item.l, 180, 8);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(200, 200, 25, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#c62828';
    ctx.stroke();

    ctx.fillStyle = '#c62828';
    ctx.font = 'bold 12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('TẾT', 200, 204);
  },

  async start() {
    const nameInput = document.getElementById('username');
    const name = nameInput.value.trim();

    // Kích hoạt nhạc ngay khi user click nút này (Bypass Autoplay Policy)
    this.audio.play().catch((e) => console.log(e));

    if (!name)
      return Swal.fire('Ê!', 'Không nhập tên sao biết ai lì xì?', 'warning');

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          money: 0,
          date: new Date().toISOString(),
        }),
      });
      this.user = await res.json();

      document.getElementById('step-1').style.display = 'none';
      document.getElementById('step-2').style.display = 'block';
      this.drawWheel();
    } catch (e) {
      Swal.fire('Lỗi mạng', 'Check lại API đi bạn êi.', 'error');
    }
  },

  async spin() {
    const btn = document.getElementById('spin-btn');
    btn.disabled = true;
    btn.innerText = 'Đang quay...';

    // --- CHEAT MODE: 60 - 33 - 6 - 1 ---
    let finalMoney;
    const rand = Math.random() * 100;

    if (rand < 60)
      finalMoney = 200000; // 60%
    else if (rand < 93)
      finalMoney = 500000; // 33%
    else if (rand < 99)
      finalMoney = 100000; // 6%
    else finalMoney = 10000; // 1%

    // Logic tìm góc quay
    const possibleIndices = CONFIG.slices
      .map((s, i) => (s.v === finalMoney ? i : -1))
      .filter((i) => i !== -1);
    const targetIndex =
      possibleIndices[Math.floor(Math.random() * possibleIndices.length)];

    // Tính toán rotation (Gốc 270 độ là 12h)
    const sliceDeg = 360 / CONFIG.slices.length;
    const targetSliceCenter = targetIndex * sliceDeg + sliceDeg / 2;
    let rotateAngle = 270 - targetSliceCenter;
    while (rotateAngle < 0) rotateAngle += 360;

    // Quay tối thiểu 8 vòng
    const extraSpins = 360 * 8;
    const currentMod = this.rotation % 360;
    let distance = rotateAngle - currentMod;
    if (distance < 0) distance += 360;

    this.rotation += distance + extraSpins;
    this.canvas.style.transform = `rotate(${this.rotation}deg)`;

    setTimeout(async () => {
      await this.finishSpin(finalMoney);
    }, 8000);
  },

  async finishSpin(money) {
    try {
      await fetch(`${API_URL}/${this.user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ money: money }),
      });
    } catch (e) {}

    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ffd700', '#c62828'],
    });

    document.getElementById('step-2').style.display = 'none';
    document.getElementById('step-3').style.display = 'block';

    document.getElementById('congrats-text').innerHTML =
      `Chúc mừng <b>${this.user.name}</b>!<br/>Bạn đã lì xì cho Đạt <b>${money.toLocaleString()}đ</b> 🎊`;

    // Cập nhật QR Code (API)
    // Link này sẽ tạo QR chứa nội dung chuyển khoản
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=Dat_Lixi_${money}_tu_${this.user.name}`;
    // document.getElementById('qr-img').src = qrUrl; // Uncomment nếu muốn QR động
  },

  async openAdmin() {
    const { value: password } = await Swal.fire({
      title: 'Admin Access',
      input: 'password',
      inputPlaceholder: 'Nhập mật khẩu (1234)',
      background: '#fff',
      confirmButtonColor: '#c62828',
    });

    if (password === '1234') {
      document
        .querySelectorAll('.glass-panel > div')
        .forEach((d) => (d.style.display = 'none'));
      document.getElementById('admin-panel').style.display = 'block';
      this.loadAdminData();
    } else if (password) {
      Swal.fire('Sai pass!', 'Đừng hack nữa bạn ơi.', 'error');
    }
  },

  async loadAdminData() {
    const tbody = document.getElementById('admin-list');
    const totalEl = document.getElementById('admin-total');
    tbody.innerHTML = '<tr><td colspan="2">Đang tải...</td></tr>';

    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      const validData = data.sort((a, b) => b.id - a.id);
      let total = 0;
      let html = '';

      validData.forEach((u) => {
        const m = parseInt(u.money) || 0;
        total += m;
        html += `<tr><td>${u.name}</td><td style="color: var(--gold); font-weight:bold">${m.toLocaleString()}đ</td></tr>`;
      });

      tbody.innerHTML =
        html || '<tr><td colspan="2">Chưa ai chơi cả :(</td></tr>';
      totalEl.innerHTML = `Tổng thu: ${total.toLocaleString()} VNĐ`;
    } catch (e) {
      tbody.innerHTML = '<tr><td colspan="2">Lỗi tải dữ liệu</td></tr>';
    }
  },
};

// Chạy thử autoplay khi load trang
window.onload = () => app.init();

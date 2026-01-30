const API_URL = 'https://68edcae6df2025af780116cf.mockapi.io/luckyMoney';

const CONFIG = {
  slices: [
    { v: 10000, l: '10K' },
    { v: 200000, l: '200K' },
    { v: 10000, l: '10K' },
    { v: 200000, l: '200K' },
    { v: 10000, l: '10K' },
    { v: 500000, l: '500K' },
    { v: 10000, l: '10K' },
    { v: 200000, l: '200K' },
    { v: 100000, l: '100K' },
    { v: 10000, l: '10K' },
  ],
  colors: ['#c62828', '#ffd700'],
  textColors: ['#fff', '#c62828'],
};

const app = {
  user: null,
  canvas: null,
  ctx: null,
  rotation: 0,
  audio: document.getElementById('bg-music'),
  isMuted: false,

  init() {
    this.canvas = document.getElementById('wheel');
    this.ctx = this.canvas.getContext('2d');

    // Set volume vừa phải
    this.audio.volume = 0.6;

    // --- CHIÊU TỐI ƯU: KÍCH HOẠT NHẠC KHI NHẬP TÊN ---
    const input = document.getElementById('username');

    // Hàm này chỉ chạy đúng 1 lần duy nhất rồi tự hủy
    const playMusicOnce = () => {
      if (!this.isMuted) {
        // Play ngay lập tức khi user chạm vào ô input
        this.audio
          .play()
          .then(() => {
            console.log('Nhạc đã lên nhờ sự kiện focus!');
          })
          .catch((e) => {
            console.log('Vẫn bị chặn, chờ click nút vậy');
          });
      }

      // Xóa sự kiện đi để không gọi lại nhiều lần
      input.removeEventListener('focus', playMusicOnce);
      input.removeEventListener('click', playMusicOnce);
      document.removeEventListener('click', playMusicOnce);
    };

    // Bắt sự kiện chạm vào ô input (Mobile & Desktop đều dính)
    input.addEventListener('focus', playMusicOnce);
    input.addEventListener('click', playMusicOnce);

    // Backup: Nếu nó không nhập tên mà bấm lung tung, cũng thử play luôn
    document.addEventListener('click', playMusicOnce, { once: true });
  },

  // Chức năng bật tắt nhạc
  toggleMusic() {
    this.isMuted = !this.isMuted;
    const icon = document.getElementById('music-icon');
    if (this.isMuted) {
      this.audio.pause();
      icon.innerText = '🔇';
    } else {
      this.audio.play();
      icon.innerText = '🔊';
    }
  },

  drawWheel() {
    if (!this.ctx) return;
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

    // Bypass Autoplay
    if (!this.isMuted) this.audio.play().catch(() => {});

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

    // --- CHEAT MODE GIỮ NGUYÊN ---
    let finalMoney;
    const rand = Math.random() * 100;

    if (rand < 60) finalMoney = 200000;
    else if (rand < 93) finalMoney = 500000;
    else if (rand < 99) finalMoney = 100000;
    else finalMoney = 10000;

    const possibleIndices = CONFIG.slices
      .map((s, i) => (s.v === finalMoney ? i : -1))
      .filter((i) => i !== -1);
    const targetIndex =
      possibleIndices[Math.floor(Math.random() * possibleIndices.length)];

    const sliceDeg = 360 / CONFIG.slices.length;
    const targetSliceCenter = targetIndex * sliceDeg + sliceDeg / 2;
    let rotateAngle = 270 - targetSliceCenter;
    while (rotateAngle < 0) rotateAngle += 360;

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

    // ĐÃ XOÁ CONFETTI THEO YÊU CẦU

    document.getElementById('step-2').style.display = 'none';
    document.getElementById('step-3').style.display = 'block';

    document.getElementById('congrats-text').innerHTML =
      `Em Đạt cảm ơn anh/chị <b>${this.user.name}</b> đã lì xì!<br/>Năm mới Đạt chúc anh/chị sức khoẻ dồi dào, tiền vào như nước🙏<b><br/>Tiền lì xì cho Đạt: ${money.toLocaleString()}đ</b>`;

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=Dat_Lixi_${money}_tu_${this.user.name}`;
    // document.getElementById('qr-img').src = qrUrl;
  },
};

window.onload = () => app.init();

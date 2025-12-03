<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <div class="footer-grid">
        <div class="footer-brand">
          <img src="@/assets/SPORTSY__1_-removebg-preview.png" alt="Logo" class="logo" />
          <p class="tagline">Chất lượng — Phong cách — Dịch vụ tận tâm</p>
        </div>

        <div class="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Trang chủ</a></li>
            <li><a href="/product">Sản phẩm</a></li>
            <li><a href="/contact">Liên hệ</a></li>
            <li><a href="/about">Giới thiệu</a></li>
            <li><a href="/news">Tin tức</a></li>
          </ul>
        </div>

        <div class="footer-contact">
          <h4>Liên hệ</h4>
          <p>Email: <a href="mailto:info@example.com">info@example.com</a></p>
          <p>Hotline: <a href="tel:+84123456789">+84 123 456 789</a></p>
          <div class="socials" aria-label="Mạng xã hội">
            <a href="#" aria-label="Facebook" class="social">
              <!-- Facebook SVG -->
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07c0 4.99 3.66 9.13 8.44 9.93v-7.03H7.9v-2.9h2.54V9.41c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.9h-2.34V22c4.78-.8 8.44-4.94 8.44-9.93z"/>
              </svg>
            </a>
            <a href="#" aria-label="Instagram" class="social">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 6.5A4.5 4.5 0 1016.5 13 4.5 4.5 0 0012 8.5zm5.8-3.3a1.2 1.2 0 11-1.2-1.2 1.2 1.2 0 011.2 1.2z"/>
              </svg>
            </a>
            <a href="#" aria-label="Twitter" class="social">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 5.92c-.63.28-1.3.46-2 .55a3.48 3.48 0 001.52-1.92 6.9 6.9 0 01-2.2.84A3.45 3.45 0 0016.1 5c-1.9 0-3.45 1.66-3 3.5A9.8 9.8 0 013 5.9a3.5 3.5 0 001.07 4.67c-.5 0-1-.15-1.42-.38v.04c0 1.65 1.18 3.03 2.74 3.35-.45.13-.9.17-1.38.06a3.5 3.5 0 003.26 2.43A6.92 6.92 0 012 19.54 9.77 9.77 0 008.4 21c6.3 0 9.74-5.24 9.74-9.78v-.44A6.9 6.9 0 0022 5.92z"/>
              </svg>
            </a>
          </div>
        </div>

        <div class="footer-newsletter">
          <h4>Nhận thông tin</h4>
          <p class="small">Đăng ký để nhận khuyến mãi và tin tức mới nhất.</p>
          <form @submit.prevent="subscribe" class="newsletter-form" aria-label="Đăng ký email">
            <input v-model="email" type="email" placeholder="Nhập email của bạn" aria-label="email" />
            <button type="submit">Đăng ký</button>
          </form>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; {{ year }} QLBH. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'FooterLayout',
  data() {
    return {
      email: '',
      year: new Date().getFullYear()
    };
  },
  methods: {
    subscribe() {
      const email = this.email && this.email.trim();
      const re = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
      if (!email || !re.test(email)) {
        alert('Vui lòng nhập địa chỉ email hợp lệ.');
        return;
      }
      // TODO: tích hợp API đăng ký email nếu cần
      alert('Cảm ơn! Chúng tôi đã nhận email: ' + email);
      this.email = '';
    }
  }
};
</script>

<style scoped>
.app-footer {
  background: linear-gradient(180deg, #0f1724 0%, #172033 100%);
  color: #e6eef8;
  padding: 32px 16px;
}
.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
}
.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  align-items: start;
}
.footer-brand .logo {
  max-width: 160px;
  height: auto;
  display: block;
  margin-bottom: 12px;
}
.footer-brand .tagline {
  color: #bcd2f6;
  margin: 0;
}
.footer-links h4,
.footer-contact h4,
.footer-newsletter h4 {
  margin: 0 0 10px 0;
  color: #fff;
}
.footer-links ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.footer-links li {
  margin-bottom: 8px;
}
.footer-links a {
  color: #cfe6ff;
  text-decoration: none;
}
.footer-links a:hover {
  text-decoration: underline;
}
.footer-contact p {
  margin: 6px 0;
}
.socials {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}
.social {
  color: #dbefff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  background: rgba(255,255,255,0.03);
}
.social svg { fill: currentColor; }
.footer-newsletter .small { color: #c3d8f8; margin-bottom: 8px; }
.newsletter-form {
  display: flex;
  gap: 8px;
}
.newsletter-form input {
  flex: 1 1 auto;
  padding: 8px 10px;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 6px;
  background: rgba(255,255,255,0.02);
  color: #e6eef8;
}
.newsletter-form input::placeholder { color: rgba(230,238,248,0.6); }
.newsletter-form button {
  background: #0ea5a4;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
}
.newsletter-form button:hover { background: #089b99; }
.footer-bottom {
  margin-top: 22px;
  border-top: 1px solid rgba(255,255,255,0.04);
  padding-top: 14px;
  text-align: center;
  color: #9fbbe6;
}

@media (max-width: 640px) {
  .newsletter-form { flex-direction: column; }
  .newsletter-form button { width: 100%; }
}
</style>

(function () {
  'use strict';

  const API = 'https://ledgr-backend-7hmh.onrender.com';

  // ── CSS (injected once) ──────────────────────────────────────────
  function injectCSS() {
    if (document.getElementById('ve-styles')) return;
    const s = document.createElement('style');
    s.id = 've-styles';
    s.textContent = `
/* ═══ EMAIL VERIFICATION SCREEN ════════════════════════════════ */
.ve-screen{display:flex;flex-direction:column;align-items:center;text-align:center}

.ve-envelope{font-size:48px;line-height:1;margin-bottom:20px;animation:ve-float 3s ease-in-out infinite}
@keyframes ve-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}

.ve-title{font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:4px;color:#f0edff;margin-bottom:10px}

.ve-sub{font-family:'DM Mono',monospace;font-size:11px;color:#6a6690;letter-spacing:.5px;line-height:1.7;margin-bottom:6px}
.ve-email-val{color:#b89fff;font-weight:700;display:block;margin-top:2px;font-size:12px}

/* OTP Boxes */
.ve-otp-wrap{display:flex;gap:8px;justify-content:center;margin:24px 0 6px}
.ve-otp-box{
  width:44px;height:54px;
  background:#15122a;
  border:2px solid rgba(184,159,255,0.15);
  border-radius:10px;
  text-align:center;
  font-family:'DM Mono',monospace;
  font-size:22px;font-weight:700;
  color:#f0edff;
  caret-color:#b89fff;
  outline:none;
  transition:border-color .15s,box-shadow .15s,transform .1s;
  -webkit-appearance:none;
  appearance:none
}
.ve-otp-box:focus{
  border-color:#b89fff;
  box-shadow:0 0 0 3px rgba(184,159,255,0.15);
  transform:scale(1.04)
}
.ve-otp-box.ve-filled{border-color:rgba(184,159,255,0.4)}
.ve-otp-box.ve-error{border-color:#f87171;box-shadow:0 0 0 3px rgba(248,113,113,0.12)}
@media(max-width:380px){.ve-otp-box{width:38px;height:48px;font-size:18px;gap:5px}}

/* Message */
.ve-msg{font-family:'DM Mono',monospace;font-size:11px;min-height:18px;margin-bottom:16px;letter-spacing:.3px;transition:color .2s}

/* Buttons */
.ve-submit-btn{
  width:100%;background:#b89fff;color:#07060d;
  border:none;border-radius:8px;padding:13px;
  font-size:14px;font-weight:700;cursor:pointer;
  font-family:'Syne',sans-serif;transition:all .2s;
  margin-bottom:10px
}
.ve-submit-btn:hover:not(:disabled){background:#cdb8ff}
.ve-submit-btn:disabled{opacity:.65;cursor:not-allowed}

.ve-resend-btn{
  background:none;border:1px solid rgba(184,159,255,0.15);
  border-radius:8px;padding:10px 20px;width:100%;
  font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.5px;
  color:#6a6690;cursor:pointer;transition:all .2s;margin-bottom:14px
}
.ve-resend-btn:hover:not(:disabled){border-color:rgba(184,159,255,0.3);color:#9590b8}
.ve-resend-btn:disabled{cursor:not-allowed;opacity:.7}

.ve-back-btn{
  background:none;border:none;font-family:'DM Mono',monospace;
  font-size:11px;color:#544f6e;cursor:pointer;transition:color .2s;
  padding:4px 0;letter-spacing:.5px
}
.ve-back-btn:hover{color:#b89fff}

/* Success state */
.ve-success-icon{font-size:52px;margin-bottom:16px;animation:ve-pop .4s cubic-bezier(.34,1.56,.64,1)}
@keyframes ve-pop{from{transform:scale(0)}to{transform:scale(1)}}
`;
    document.head.appendChild(s);
  }

  // ── Helpers ──────────────────────────────────────────────────────
  function getCode() {
    return Array.from(document.querySelectorAll('.ve-otp-box'))
      .map(function (b) { return b.value; }).join('');
  }

  function setMsg(msg, color) {
    var el = document.getElementById('veMsg');
    if (!el) return;
    el.textContent = msg;
    el.style.color = color || 'var(--mu)';
  }

  function markError(on) {
    document.querySelectorAll('.ve-otp-box').forEach(function (b) {
      b.classList.toggle('ve-error', on);
    });
  }

  function initBoxes(onComplete) {
    var boxes = Array.from(document.querySelectorAll('.ve-otp-box'));

    boxes.forEach(function (box, i) {
      box.addEventListener('input', function () {
        box.value = box.value.replace(/\D/g, '').slice(-1);
        box.classList.toggle('ve-filled', !!box.value);
        markError(false);
        setMsg('', '');
        if (box.value) {
          if (i < boxes.length - 1) {
            boxes[i + 1].focus();
          } else if (getCode().length === 6) {
            onComplete();
          }
        }
      });

      box.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && !box.value && i > 0) {
          boxes[i - 1].value = '';
          boxes[i - 1].classList.remove('ve-filled');
          boxes[i - 1].focus();
        }
        // Allow only digits, navigation keys, backspace
        if (!/^\d$/.test(e.key) && !['Backspace','Delete','Tab','ArrowLeft','ArrowRight'].includes(e.key)) {
          e.preventDefault();
        }
      });

      box.addEventListener('paste', function (e) {
        e.preventDefault();
        var text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
        text.split('').forEach(function (ch, j) {
          if (boxes[j]) { boxes[j].value = ch; boxes[j].classList.add('ve-filled'); }
        });
        var last = Math.min(text.length, boxes.length) - 1;
        if (last >= 0) boxes[last].focus();
        if (text.length === 6) onComplete();
      });

      // Click — select content so re-typing is easy
      box.addEventListener('click', function () { box.select(); });
    });

    // Focus first empty box or first box
    var firstEmpty = boxes.find(function (b) { return !b.value; });
    (firstEmpty || boxes[0]).focus();
  }

  function startCountdown(btnId, seconds) {
    var btn = document.getElementById(btnId);
    if (!btn) return;
    var t = seconds;
    btn.disabled = true;
    btn.textContent = 'Resend code (' + t + 's)';
    var iv = setInterval(function () {
      t--;
      if (t <= 0) {
        clearInterval(iv);
        btn.disabled = false;
        btn.textContent = 'Resend code';
      } else {
        btn.textContent = 'Resend code (' + t + 's)';
      }
    }, 1000);
    return iv;
  }

  function buildScreenHTML(email) {
    var boxes = '';
    for (var i = 0; i < 6; i++) {
      boxes += '<input class="ve-otp-box" id="ve-box-' + i + '" type="text" inputmode="numeric" ' +
               'pattern="[0-9]*" maxlength="1" autocomplete="' + (i === 0 ? 'one-time-code' : 'off') + '" ' +
               'aria-label="Digit ' + (i + 1) + '">';
    }
    return '<div class="ve-screen">' +
      '<div class="ve-envelope">📬</div>' +
      '<div class="ve-title">Check your email</div>' +
      '<div class="ve-sub">We sent a 6-digit code to<span class="ve-email-val">' + email + '</span></div>' +
      '<div class="ve-otp-wrap">' + boxes + '</div>' +
      '<div class="ve-msg" id="veMsg"></div>' +
      '<button class="ve-submit-btn" id="veSubmit">Verify →</button>' +
      '<button class="ve-resend-btn" id="veResend">Resend code (60s)</button>' +
      '<button class="ve-back-btn" id="veBack">← Use a different email</button>' +
    '</div>';
  }

  // ── Main public function ─────────────────────────────────────────
  // opts: { email, box, onSuccess, onBack }
  // box  = the container whose innerHTML will be replaced
  //        (close buttons with onclick attrs are preserved via outerHTML trick)

  function show(opts) {
    injectCSS();

    var email     = opts.email;
    var box       = opts.box;
    var onSuccess = opts.onSuccess;
    var onBack    = opts.onBack;

    // Preserve any .modal-close button (survives innerHTML replace via outerHTML)
    var closeBtn = box.querySelector('.modal-close');
    var closeBtnHtml = closeBtn ? closeBtn.outerHTML : '';

    var savedHtml = box.innerHTML;
    box.innerHTML = closeBtnHtml + buildScreenHTML(email);

    var countdownIv = startCountdown('veResend', 60);

    function doVerify() {
      var code = getCode();
      if (code.length !== 6) {
        markError(true);
        setMsg('Enter all 6 digits', '#f87171');
        return;
      }
      var btn = document.getElementById('veSubmit');
      btn.disabled = true;
      btn.textContent = 'Verifying...';
      setMsg('', '');

      fetch(API + '/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, code: code })
      })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.token && d.user) {
          clearInterval(countdownIv);
          setMsg('Email verified! ✓', '#34d399');
          onSuccess(d);
        } else {
          markError(true);
          setMsg(d.error || 'Invalid code — try again', '#f87171');
          btn.disabled = false;
          btn.textContent = 'Verify →';
        }
      })
      .catch(function () {
        setMsg('Connection error — try again', '#f87171');
        btn.disabled = false;
        btn.textContent = 'Verify →';
      });
    }

    initBoxes(doVerify);

    document.getElementById('veSubmit').addEventListener('click', doVerify);

    document.getElementById('veResend').addEventListener('click', function () {
      var btn = document.getElementById('veResend');
      btn.disabled = true;
      setMsg('Sending...', '#9590b8');

      fetch(API + '/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.error) {
          setMsg(d.error, '#f87171');
          btn.disabled = false;
        } else {
          setMsg('Code resent — check your email', '#34d399');
          document.querySelectorAll('.ve-otp-box').forEach(function (b) {
            b.value = ''; b.classList.remove('ve-filled', 've-error');
          });
          var firstBox = document.querySelector('.ve-otp-box');
          if (firstBox) firstBox.focus();
          clearInterval(countdownIv);
          countdownIv = startCountdown('veResend', 60);
        }
      })
      .catch(function () {
        setMsg('Could not resend — try again', '#f87171');
        btn.disabled = false;
      });
    });

    document.getElementById('veBack').addEventListener('click', function () {
      clearInterval(countdownIv);
      if (typeof onBack === 'function') {
        onBack();
      } else {
        box.innerHTML = savedHtml;
      }
    });
  }

  window.VerifyEmail = { show: show };

})();

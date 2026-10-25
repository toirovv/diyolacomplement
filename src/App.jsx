import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import {
  ArrowRight,
  Feather,
  Flower2,
  Hand,
  Heart,
  Moon,
  Orbit,
  RotateCcw,
  Sparkles,
  Star,
  Stars,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  EDIT HERE                                                          */
/* ------------------------------------------------------------------ */

const CONFIG = {
  name: 'Диерааа'
  ,
  letter: {
    title: 'Для ЧИКО',
    paragraphs: [
    'знаю что это обычно которые я делаю крч  я расскажу про твою характер ушааанда етунд расскажи дб' ,
        'ну вот короче ты сама знаешь что у тебя меняеться характер и эмоции за секунду ну вот колоче много много есть вещи которые долже рассказать но не поместиться',
        'первыыйы характер что не нравиться это ты слишкооом добрый для каждеееего ну саавол нме унака? и 2 вещь это публикации видео и которые нравиться это когда добр ко мне а не всем и еще много много есть которые нравиться но улани этиш учун 99 вароли дафтар  короче ты чики чики понел? и еще самый прям муах характер когда ты злишься прям глаза огрооомные и когда блмадм качон класан но топ топ прям кчиканлага охщаб класа и агар вд койш йо кб ташасн прям идеальный боласа чунки коп внимание овоса пп йинда окрвома крч ты супер пупер лучшая подруга когда ты слышишь мои дардлар и когда поддерживаешь и заааа этого ценю и еще не кому не говорил про мои секреты с такой доверии и крч с тобой веслее чем тимур или ктотоам  ты культурнее и один прям вохнендивьшый твой привычка это не понемать мои советы которые бля онасини емсн 100 марта етканларим  крч грубо говоря нету минусов нооо плюсы дафигищщеееее и еще один привычка йозган нарсами 10000000 соатан кегн окисан бляя кеча кутурб ухлаб кобма  крч по всей статусов ты выираешь по красоте по манере по кульуров по поддержке по игнорам по характер и эмоциииииииииии изза этого ты важнее чем все мои друзьям'
    ],
    signature: 'doim iliqlik bilan',
  },
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const easeOut = [0.22, 1, 0.36, 1]

const sceneVariants = {
  initial: { opacity: 0, scale: 0.985, filter: 'blur(8px)' },
  animate: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.65, ease: easeOut },
  },
  exit: {
    opacity: 0,
    scale: 1.012,
    filter: 'blur(9px)',
    transition: { duration: 0.34, ease: [0.4, 0, 1, 1] },
  },
}

function haptic(pattern = 8) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern)
    } catch {
      /* silently ignore */
    }
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

function easeOutBack(t) {
  const c1 = 1.4
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

/* ------------------------------------------------------------------ */
/*  Canvas: galaxy -> name -> seed -> bloom                            */
/* ------------------------------------------------------------------ */

const SPRITE_COLORS = ['255,252,247', '246,205,216', '201,112,138', '138,82,104']

function makeSprite(rgb) {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  const glow = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  glow.addColorStop(0, `rgba(${rgb},1)`)
  glow.addColorStop(0.16, `rgba(${rgb},0.96)`)
  glow.addColorStop(0.36, `rgba(${rgb},0.44)`)
  glow.addColorStop(0.68, `rgba(${rgb},0.12)`)
  glow.addColorStop(1, `rgba(${rgb},0)`)
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, 64, 64)
  return canvas
}

function createState(width, height, dpr, reduced) {
  const w = Math.max(1, width)
  const h = Math.max(1, height)
  const area = w * h
  const count = reduced
    ? clamp(Math.round(area / 700), 500, 900)
    : clamp(Math.round(area / 240), 900, 1900)

  const state = {
    w,
    h,
    dpr,
    count,
    reduced,
    R: Math.min(w * 0.44, h * 0.26),
    cx: w / 2,
    cy: h * 0.45,
    x: new Float32Array(count),
    y: new Float32Array(count),
    vx: new Float32Array(count),
    vy: new Float32Array(count),
    tx: new Float32Array(count),
    ty: new Float32Array(count),
    fx: new Float32Array(count),
    fy: new Float32Array(count),
    gr: new Float32Array(count),
    ga: new Float32Array(count),
    gd: new Float32Array(count),
    size: new Float32Array(count),
    alpha: new Float32Array(count),
    color: new Uint8Array(count),
    phase: new Float32Array(count),
    speed: new Float32Array(count),
    k: new Float32Array(count),
    delay: new Float32Array(count),
    burst: [],
    mode: 'galaxy',
    modeStart: performance.now(),
    last: performance.now(),
    spin: 0,
    spinVel: 0,
    tilt: 0.52,
    autoSpin: reduced ? 0 : 0.1,
    parX: 0,
    parY: 0,
    parTargetX: 0,
    parTargetY: 0,
    interacted: false,
    shock: 0,
  }

  for (let i = 0; i < count; i += 1) {
    const isCore = Math.random() < 0.24
    const r = isCore
      ? Math.pow(Math.random(), 1.9) * 0.3
      : 0.13 + Math.pow(Math.random(), 0.92) * 0.97
    const arm = i % 3
    const spread = 0.09 + (1 - r) * 0.34
    const angle = isCore
      ? Math.random() * Math.PI * 2
      : arm * ((Math.PI * 2) / 3) + r * 4.9 + (Math.random() - 0.5) * spread * 2

    state.gr[i] = r
    state.ga[i] = angle
    state.gd[i] = Math.random()
    state.phase[i] = Math.random() * Math.PI * 2
    state.speed[i] = 0.4 + Math.random() * 1.1
    state.k[i] = 0.72 + Math.random() * 0.62
    state.delay[i] = Math.random() * 0.26

    const roll = Math.random()
    state.color[i] = roll < 0.34 ? 2 : roll < 0.62 ? 1 : roll < 0.84 ? 3 : 0
    state.alpha[i] = 0.32 + Math.random() * 0.58
    state.size[i] = 5.4 + Math.random() * 5.2

    state.x[i] =
      state.cx +
      Math.cos(angle) * r * state.R +
      (Math.random() - 0.5) * 10
    state.y[i] =
      state.cy +
      Math.sin(angle) * r * state.R * state.tilt +
      (Math.random() - 0.5) * 10
    state.vx[i] = 0
    state.vy[i] = 0
  }

  return state
}

function resizeState(state, width, height, dpr) {
  const w = Math.max(1, width)
  const h = Math.max(1, height)
  if (Math.abs(w - state.w) < 0.5 && Math.abs(h - state.h) < 0.5) return false

  const oldCx = state.cx
  const oldCy = state.cy
  const sx = w / state.w
  const sy = h / state.h

  for (let i = 0; i < state.count; i += 1) {
    state.x[i] = w / 2 + (state.x[i] - oldCx) * sx
    state.y[i] = h / 2 + (state.y[i] - oldCy) * sy
    state.tx[i] = w / 2 + (state.tx[i] - oldCx) * sx
    state.ty[i] = h / 2 + (state.ty[i] - oldCy) * sy
    state.fx[i] *= Math.min(sx, sy)
    state.fy[i] *= Math.min(sx, sy)
  }

  state.w = w
  state.h = h
  state.dpr = dpr
  state.cx = w / 2
  state.cy = h * 0.45
  state.R = Math.min(w * 0.44, h * 0.26)
  return true
}

async function prepareNameTargets(state) {
  if (typeof document === 'undefined') return null

  try {
    if (document.fonts?.load) {
      await Promise.race([
        Promise.all([
          document.fonts.load('600 100px "Cormorant Garamond"'),
          document.fonts.load('italic 500 100px "Cormorant Garamond"'),
        ]),
        new Promise((resolve) => window.setTimeout(resolve, 1400)),
      ])
    }
  } catch {
    /* fall back to the serif stack */
  }

  const w = Math.max(1, Math.round(state.w))
  const h = Math.max(1, Math.round(state.h))
  const off = document.createElement('canvas')
  off.width = w
  off.height = h
  const ctx = off.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null

  const name = CONFIG.name.toUpperCase()
  const fontOf = (size) =>
    `600 ${size}px "Cormorant Garamond", "Playfair Display", Georgia, serif`
  const targetWidth = Math.min(state.w * 0.84, 380)
  let fontSize = Math.min(state.h * 0.13, 132)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = fontOf(fontSize)
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${fontSize * 0.08}px`
  let metrics = ctx.measureText(name)

  if (metrics.width > targetWidth) {
    fontSize *= targetWidth / metrics.width
    ctx.font = fontOf(fontSize)
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${fontSize * 0.08}px`
    metrics = ctx.measureText(name)
  }

  fontSize = Math.min(fontSize, state.h * 0.2)
  ctx.font = fontOf(fontSize)
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${fontSize * 0.08}px`
  metrics = ctx.measureText(name)

  const centerY = state.h * 0.42
  ctx.fillStyle = '#ffffff'
  ctx.fillText(name, state.w / 2, centerY)

  const x0 = Math.max(0, Math.floor(state.w / 2 - metrics.width / 2 - 6))
  const x1 = Math.min(w, Math.ceil(state.w / 2 + metrics.width / 2 + 6))
  const y0 = Math.max(0, Math.floor(centerY - fontSize * 0.9))
  const y1 = Math.min(h, Math.ceil(centerY + fontSize * 0.9))
  if (x1 <= x0 || y1 <= y0) return null

  const image = ctx.getImageData(x0, y0, x1 - x0, y1 - y0).data
  const points = []
  const sampleW = x1 - x0
  const step = 2

  for (let yy = 0; yy < y1 - y0; yy += step) {
    for (let xx = 0; xx < sampleW; xx += step) {
      const alpha = image[(yy * sampleW + xx) * 4 + 3]
      if (alpha > 110) points.push(x0 + xx, y0 + yy)
    }
  }

  if (points.length < 8) return null

  const pointCount = points.length / 2
  const order = new Uint32Array(pointCount)
  for (let i = 0; i < pointCount; i += 1) order[i] = i
  for (let i = pointCount - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = order[i]
    order[i] = order[j]
    order[j] = tmp
  }

  const tx = new Float32Array(state.count)
  const ty = new Float32Array(state.count)
  for (let i = 0; i < state.count; i += 1) {
    const point = order[i % pointCount] * 2
    tx[i] = points[point] + (Math.random() - 0.5) * 1.7
    ty[i] = points[point + 1] + (Math.random() - 0.5) * 1.7
  }

  return { tx, ty }
}

function buildBloom(state) {
  const R = Math.min(state.w * 0.38, state.h * 0.18)
  const petals = 7

  for (let i = 0; i < state.count; i += 1) {
    const roll = Math.random()
    if (roll < 0.25) {
      const angle = Math.random() * Math.PI * 2
      const radius = Math.sqrt(Math.random()) * R * 0.17
      state.fx[i] = Math.cos(angle) * radius
      state.fy[i] = Math.sin(angle) * radius * 0.92
      state.gd[i] = Math.random() * 0.3
    } else if (roll < 0.33) {
      const angle = Math.random() * Math.PI * 2
      const radius = R * (0.19 + Math.random() * 0.16)
      state.fx[i] = Math.cos(angle) * radius
      state.fy[i] = Math.sin(angle) * radius
      state.gd[i] = Math.random() * 0.4
    } else {
      const petal = Math.floor(Math.random() * petals)
      const base = -Math.PI / 2 + petal * ((Math.PI * 2) / petals)
      const along = (0.08 + Math.pow(Math.random(), 0.72) * 0.92) * R * 0.94
      const width = Math.sin(Math.PI * clamp(along / (R * 0.94), 0, 1))
      const lateral =
        (Math.random() * 2 - 1) * width * R * (0.13 + Math.random() * 0.055)
      state.fx[i] =
        Math.cos(base) * along - Math.sin(base) * lateral
      state.fy[i] =
        Math.sin(base) * along + Math.cos(base) * lateral
      state.gd[i] = Math.random()
    }
  }

  state.shock = 0
  state.burst = []
  const burstCount = state.reduced ? 24 : 84
  for (let i = 0; i < burstCount; i += 1) {
    const angle = Math.random() * Math.PI * 2
    const speed = 55 + Math.random() * 250
    state.burst.push({
      x: state.cx,
      y: state.cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      max: 0.8 + Math.random() * 1.1,
      delay: Math.random() * 0.28,
      size: 4 + Math.random() * 7,
      color: Math.floor(Math.random() * 4),
    })
  }
}

function ParticleField({ mode, chargeRef, onInteract }) {
  const canvasRef = useRef(null)
  const stateRef = useRef(null)
  const modeRef = useRef(mode)
  const onInteractRef = useRef(onInteract)

  useEffect(() => {
    onInteractRef.current = onInteract
  }, [onInteract])

  useEffect(() => {
    modeRef.current = mode
    const state = stateRef.current
    if (!state) return undefined

    let cancelled = false

    if (mode === 'galaxy') {
      state.mode = 'galaxy'
      state.modeStart = performance.now()
    } else if (mode === 'seed') {
      state.mode = 'seed'
      state.modeStart = performance.now()
    } else if (mode === 'bloom') {
      buildBloom(state)
      state.mode = 'bloom'
      state.modeStart = performance.now()
    } else if (mode === 'name') {
      prepareNameTargets(state).then((targets) => {
        if (cancelled || !targets || stateRef.current !== state) return
        state.tx.set(targets.tx)
        state.ty.set(targets.ty)
        state.mode = 'name'
        state.modeStart = performance.now()
      })
    }

    return () => {
      cancelled = true
    }
  }, [mode])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const sprites = SPRITE_COLORS.map(makeSprite)
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return undefined

    let cssW = 0
    let cssH = 0
    let dpr = 1
    let raf = 0
    let dragging = false
    let lastX = 0
    let lastY = 0
    let lastT = 0
    let dragVel = 0
    let state = null
    let resizeObserver = null

    const measure = () => {
      const rect = canvas.getBoundingClientRect()
      return {
        w: rect.width || window.innerWidth,
        h: rect.height || window.innerHeight,
        dpr: Math.min(2, window.devicePixelRatio || 1),
      }
    }

    const applySize = (w, h, nextDpr) => {
      cssW = w
      cssH = h
      dpr = nextDpr
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.imageSmoothingEnabled = true
    }

    const initial = measure()
    applySize(initial.w, initial.h, initial.dpr)
    state = createState(initial.w, initial.h, initial.dpr, reduced)
    state.mode = modeRef.current === 'name' ? 'galaxy' : modeRef.current
    stateRef.current = state

    if (modeRef.current === 'name') {
      prepareNameTargets(state).then((targets) => {
        if (!targets || stateRef.current !== state) return
        state.tx.set(targets.tx)
        state.ty.set(targets.ty)
        state.mode = 'name'
        state.modeStart = performance.now()
      })
    } else if (modeRef.current === 'bloom') {
      buildBloom(state)
      state.modeStart = performance.now()
    }

    const resize = () => {
      const next = measure()
      const dprChanged = next.dpr !== dpr
      if (
        !dprChanged &&
        Math.abs(next.w - cssW) < 0.5 &&
        Math.abs(next.h - cssH) < 0.5
      ) {
        return
      }
      const w = next.w
      const h = next.h
      if (state) resizeState(state, w, h, next.dpr)
      applySize(w, h, next.dpr)
    }

    const interact = () => {
      if (state.interacted) return
      state.interacted = true
      onInteractRef.current?.()
    }

    const onPointerDown = (event) => {
      if (!state || state.mode !== 'galaxy') return
      dragging = true
      lastX = event.clientX
      lastY = event.clientY
      lastT = performance.now()
      dragVel = 0
      canvas.setPointerCapture?.(event.pointerId)
      interact()
    }

    const onPointerMove = (event) => {
      if (!state) return
      const rect = canvas.getBoundingClientRect()
      state.parTargetX = ((event.clientX - rect.left) / rect.width - 0.5) * 14
      state.parTargetY = ((event.clientY - rect.top) / rect.height - 0.5) * 12

      if (!dragging || state.mode !== 'galaxy') return
      const now = performance.now()
      const dx = event.clientX - lastX
      const dy = event.clientY - lastY
      const elapsed = Math.max(12, now - lastT)
      state.spin += dx * 0.0058
      state.tilt = clamp(state.tilt + dy * 0.0015, 0.34, 0.68)
      dragVel = (dx / elapsed) * 16
      lastX = event.clientX
      lastY = event.clientY
      lastT = now
    }

    const endDrag = () => {
      if (!dragging) return
      dragging = false
      if (state) state.spinVel = clamp(state.spinVel + dragVel * 0.004, -3.4, 3.4)
      dragVel = 0
    }

    const onPointerLeave = () => {
      if (state && !dragging) {
        state.parTargetX = 0
        state.parTargetY = 0
      }
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', endDrag)
    canvas.addEventListener('pointercancel', endDrag)
    canvas.addEventListener('pointerleave', onPointerLeave)

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(canvas)
    } else {
      window.addEventListener('resize', resize)
    }

    const draw = (now) => {
      const s = stateRef.current
      if (!s) return
      raf = window.requestAnimationFrame(draw)

      const dt = Math.min(0.05, Math.max(0.001, (now - s.last) / 1000))
      s.last = now
      const time = now / 1000
      const charge = s.reduced ? 1 : clamp(chargeRef?.current ?? 0, 0, 1)

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, cssW, cssH)
      ctx.globalCompositeOperation = 'source-over'

      s.parX += (s.parTargetX - s.parX) * Math.min(1, dt * 3.2)
      s.parY += (s.parTargetY - s.parY) * Math.min(1, dt * 3.2)
      s.spin += (s.autoSpin + s.spinVel) * dt
      s.spinVel *= Math.exp(-1.5 * dt)

      const cx = s.cx
      const cy = s.cy
      const R = s.R
      const modeNow = s.mode

      /* soft light behind the dots */
      if (modeNow === 'galaxy') {
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.18)
        glow.addColorStop(0, 'rgba(255,252,246,0.92)')
        glow.addColorStop(0.12, 'rgba(246,213,220,0.46)')
        glow.addColorStop(0.45, 'rgba(201,112,138,0.13)')
        glow.addColorStop(1, 'rgba(201,112,138,0)')
        ctx.save()
        ctx.translate(cx, cy)
        ctx.scale(1, 0.7)
        ctx.translate(-cx, -cy)
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(cx, cy, R * 1.18, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      } else if (modeNow === 'name') {
        const wordGlow = ctx.createRadialGradient(
          s.w / 2,
          s.h * 0.42,
          0,
          s.w / 2,
          s.h * 0.42,
          s.w * 0.46,
        )
        wordGlow.addColorStop(0, 'rgba(246,213,220,0.2)')
        wordGlow.addColorStop(0.6, 'rgba(246,213,220,0.06)')
        wordGlow.addColorStop(1, 'rgba(246,213,220,0)')
        ctx.fillStyle = wordGlow
        ctx.fillRect(0, 0, cssW, cssH)
      } else if (modeNow === 'seed') {
        const pulse = s.reduced ? 0 : 0.5 + 0.5 * Math.sin(time * 2.6)
        const radius = 26 + charge * 74 + pulse * (5 + charge * 14)
        const seedGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
        seedGlow.addColorStop(0, `rgba(255,253,248,${0.72 + charge * 0.25})`)
        seedGlow.addColorStop(0.3, `rgba(246,213,220,${0.4 + charge * 0.3})`)
        seedGlow.addColorStop(0.66, `rgba(201,112,138,${0.12 + charge * 0.2})`)
        seedGlow.addColorStop(1, 'rgba(201,112,138,0)')
        ctx.fillStyle = seedGlow
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.fill()
      } else if (modeNow === 'bloom') {
        const flowerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.65)
        flowerGlow.addColorStop(0, 'rgba(255,252,247,0.85)')
        flowerGlow.addColorStop(0.22, 'rgba(246,213,220,0.38)')
        flowerGlow.addColorStop(0.62, 'rgba(201,112,138,0.1)')
        flowerGlow.addColorStop(1, 'rgba(201,112,138,0)')
        ctx.fillStyle = flowerGlow
        ctx.beginPath()
        ctx.arc(cx, cy, R * 1.65, 0, Math.PI * 2)
        ctx.fill()
      }

      /* particles */
      if (modeNow === 'galaxy') {
        for (let i = 0; i < s.count; i += 1) {
          const angle = s.ga[i] + s.spin
          const ca = Math.cos(angle)
          const sa = Math.sin(angle)
          const rr = s.gr[i] * R
          const depth = (sa + 1) * 0.5
          const px =
            cx +
            ca * rr +
            s.parX * (0.25 + s.gd[i] * 0.85) +
            (s.reduced ? 0 : Math.sin(time * 0.45 + s.phase[i]) * 0.7)
          const py =
            cy +
            sa * rr * s.tilt +
            s.parY * (0.25 + s.gd[i] * 0.85) +
            (s.reduced ? 0 : Math.cos(time * 0.4 + s.phase[i]) * 0.7)
          const twinkle = s.reduced
            ? 1
            : 0.64 + 0.36 * Math.sin(time * s.speed[i] + s.phase[i] * 3.1)
          const alpha = clamp(
            s.alpha[i] * (0.5 + depth * 0.5) * twinkle + 0.05,
            0.03,
            1,
          )
          const dot = s.size[i] * (0.72 + depth * 0.52)
          const sprite = sprites[s.color[i]]
          ctx.globalAlpha = alpha
          ctx.drawImage(sprite, px - dot / 2, py - dot / 2, dot, dot)
        }
      } else if (modeNow === 'name') {
        const elapsed = (now - s.modeStart) / 1000
        for (let i = 0; i < s.count; i += 1) {
          const local = elapsed - s.delay[i]
          const settle = s.reduced ? 1 : Math.min(1, Math.max(0, local / 0.8))
          const shimmer = s.reduced ? 0 : 0.85
          const targetX =
            s.tx[i] + Math.sin(time * 0.9 + s.phase[i] * 2.3) * shimmer
          const targetY =
            s.ty[i] + Math.cos(time * 0.8 + s.phase[i] * 1.7) * shimmer
          const stiffness = local > 0 ? s.k[i] * 104 * settle : 0
          const damping = 15.5
          const ax = (targetX - s.x[i]) * stiffness - s.vx[i] * damping
          const ay = (targetY - s.y[i]) * stiffness - s.vy[i] * damping
          s.vx[i] += ax * dt
          s.vy[i] += ay * dt
          s.x[i] += s.vx[i] * dt
          s.y[i] += s.vy[i] * dt

          const twinkle = s.reduced
            ? 1
            : 0.78 + 0.22 * Math.sin(time * s.speed[i] * 1.4 + s.phase[i])
          const dot = s.size[i] * 0.94
          const sprite = sprites[s.color[i] === 0 ? 1 : s.color[i]]
          ctx.globalAlpha = clamp(s.alpha[i] * 1.28 * twinkle, 0.08, 1)
          ctx.drawImage(sprite, s.x[i] - dot / 2, s.y[i] - dot / 2, dot, dot)
        }
      } else if (modeNow === 'seed') {
        for (let i = 0; i < s.count; i += 1) {
          const distX = s.cx - s.x[i]
          const distY = s.cy - s.y[i]
          const dist = Math.hypot(distX, distY) || 0.001
          const orbitRadius = 1.4 + s.gd[i] * 4.4
          const orbitAngle =
            s.phase[i] +
            time * (0.35 + s.speed[i] * 0.3) * (1 + charge * 1.7)
          const targetX = s.cx + Math.cos(orbitAngle) * orbitRadius
          const targetY = s.cy + Math.sin(orbitAngle) * orbitRadius * 0.9
          const far = dist > 42
          const stiffness = far ? 27 : 112
          const damping = far ? 8 : 19
          let ax = (targetX - s.x[i]) * stiffness - s.vx[i] * damping
          let ay = (targetY - s.y[i]) * stiffness - s.vy[i] * damping
          if (dist > 4) {
            const swirl =
              (190 + charge * 430) * Math.min(1, dist / 110)
            ax += (-distY / dist) * swirl
            ay += (distX / dist) * swirl
          }
          s.vx[i] += ax * dt
          s.vy[i] += ay * dt
          s.x[i] += s.vx[i] * dt
          s.y[i] += s.vy[i] * dt

          const twinkle = s.reduced
            ? 1
            : 0.7 + 0.3 * Math.sin(time * s.speed[i] * 2 + s.phase[i])
          const dot = s.size[i] * (0.8 + charge * 0.22)
          const sprite = sprites[s.color[i]]
          ctx.globalAlpha = clamp(s.alpha[i] * (0.7 + charge * 0.3) * twinkle, 0.08, 1)
          ctx.drawImage(sprite, s.x[i] - dot / 2, s.y[i] - dot / 2, dot, dot)
        }
      } else if (modeNow === 'bloom') {
        const elapsed = (now - s.modeStart) / 1000
        const rawOpen = s.reduced ? 1 : clamp(elapsed / 1.5, 0, 1)
        const open = s.reduced ? 1 : easeOutBack(rawOpen)
        const rotation = s.reduced ? 0 : time * 0.055
        const cosR = Math.cos(rotation)
        const sinR = Math.sin(rotation)

        for (let i = 0; i < s.count; i += 1) {
          const rotatedX = s.fx[i] * cosR - s.fy[i] * sinR
          const rotatedY = s.fx[i] * sinR + s.fy[i] * cosR
          const shimmer = s.reduced
            ? 0
            : Math.sin(time * 0.65 + s.phase[i] * 2) * 0.7
          const targetX = s.cx + rotatedX * open + shimmer
          const targetY =
            s.cy + rotatedY * open + Math.cos(time * 0.6 + s.phase[i]) * 0.7
          const stiffness = s.k[i] * 64
          const damping = 13
          const ax = (targetX - s.x[i]) * stiffness - s.vx[i] * damping
          const ay = (targetY - s.y[i]) * stiffness - s.vy[i] * damping
          s.vx[i] += ax * dt
          s.vy[i] += ay * dt
          s.x[i] += s.vx[i] * dt
          s.y[i] += s.vy[i] * dt

          const twinkle = s.reduced
            ? 1
            : 0.74 + 0.26 * Math.sin(time * s.speed[i] * 1.2 + s.phase[i])
          const dot = s.size[i] * 0.9
          const sprite = sprites[s.color[i]]
          ctx.globalAlpha = clamp(s.alpha[i] * 1.1 * twinkle, 0.08, 1)
          ctx.drawImage(sprite, s.x[i] - dot / 2, s.y[i] - dot / 2, dot, dot)
        }

        if (!s.reduced) {
          s.shock += dt
          if (s.shock < 1.5) {
            const p = s.shock / 1.5
            const radius = R * (0.12 + easeOutCubic(p) * 1.35)
            ctx.globalAlpha = (1 - p) * 0.22
            ctx.strokeStyle = 'rgba(201,112,138,1)'
            ctx.lineWidth = 1.1
            ctx.beginPath()
            ctx.arc(cx, cy, radius, 0, Math.PI * 2)
            ctx.stroke()
            ctx.globalAlpha = (1 - p) * 0.12
            ctx.beginPath()
            ctx.arc(cx, cy, radius * 0.72, 0, Math.PI * 2)
            ctx.stroke()
          }

          for (let i = 0; i < s.burst.length; i += 1) {
            const b = s.burst[i]
            if (elapsed < b.delay) continue
            b.life += dt
            if (b.life > b.max) continue
            b.x += b.vx * dt
            b.y += b.vy * dt
            b.vx *= Math.exp(-0.9 * dt)
            b.vy *= Math.exp(-0.9 * dt)
            const fade = 1 - b.life / b.max
            const dot = b.size * (0.5 + fade * 0.8)
            ctx.globalAlpha = fade * 0.85
            ctx.drawImage(
              sprites[b.color],
              b.x - dot / 2,
              b.y - dot / 2,
              dot,
              dot,
            )
          }
        }
      }

      ctx.globalAlpha = 1
    }

    state.last = performance.now()
    raf = window.requestAnimationFrame(draw)

    return () => {
      window.cancelAnimationFrame(raf)
      resizeObserver?.disconnect()
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', endDrag)
      canvas.removeEventListener('pointercancel', endDrag)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      stateRef.current = null
      state = null
    }
  }, [chargeRef])

  return (
    <canvas
      ref={canvasRef}
      className="particle-canvas"
      style={{ pointerEvents: mode === 'galaxy' ? 'auto' : 'none' }}
      aria-hidden="true"
    />
  )
}

/* ------------------------------------------------------------------ */
/*  Ambient background                                                 */
/* ------------------------------------------------------------------ */

const AMBIENT = [
  { Icon: Star, top: '9%', left: '12%', size: 11, delay: 0, duration: 9, tone: 'rose' },
  { Icon: Sparkles, top: '17%', left: '82%', size: 13, delay: 1.4, duration: 11, tone: 'blush' },
  { Icon: Moon, top: '68%', left: '16%', size: 14, delay: 0.7, duration: 13, tone: 'rose' },
  { Icon: Orbit, top: '77%', left: '83%', size: 16, delay: 2.1, duration: 15, tone: 'blush' },
  { Icon: Star, top: '88%', left: '68%', size: 8, delay: 3, duration: 10, tone: 'rose' },
  { Icon: Flower2, top: '42%', left: '89%', size: 11, delay: 1.8, duration: 14, tone: 'blush' },
]

function AmbientBackground() {
  return (
    <div className="ambient" aria-hidden="true">
      {AMBIENT.map(({ Icon, top, left, size, delay, duration, tone }, index) => (
        <motion.span
          key={index}
          className={`ambient__el ambient__el--${tone}`}
          style={{ top, left }}
          animate={{
            y: [0, -13, 0],
            x: [0, 5, 0],
            rotate: [0, 9, 0],
            opacity: [0.16, 0.46, 0.16],
          }}
          transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Icon size={size} strokeWidth={1.4} />
        </motion.span>
      ))}
      <div className="ambient__nebula ambient__nebula--one" />
      <div className="ambient__nebula ambient__nebula--two" />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Shared UI                                                          */
/* ------------------------------------------------------------------ */

function PillButton({
  children,
  icon: Icon,
  onClick,
  variant = 'primary',
  className = '',
  ariaLabel,
}) {
  const [ripples, setRipples] = useState([])

  const addRipple = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX || rect.left + rect.width / 2) - rect.left
    const y = (event.clientY || rect.top + rect.height / 2) - rect.top
    const id = `${Date.now()}-${Math.random()}`
    setRipples((current) => [...current, { id, x, y }])
    haptic(6)
  }

  return (
    <motion.button
      type="button"
      className={`pill pill--${variant} ${className}`.trim()}
      onClick={onClick}
      onPointerDown={addRipple}
      whileTap={{ scale: 0.955 }}
      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
      aria-label={ariaLabel}
    >
      {Icon ? <Icon size={17} strokeWidth={1.8} aria-hidden="true" /> : null}
      <span className="pill__label">{children}</span>
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="ripple"
          aria-hidden="true"
          style={{ left: ripple.x, top: ripple.y }}
          initial={{ scale: 0, opacity: 0.55 }}
          animate={{ scale: 1.9, opacity: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          onAnimationComplete={() =>
            setRipples((current) => current.filter((item) => item.id !== ripple.id))
          }
        />
      ))}
    </motion.button>
  )
}

/* ------------------------------------------------------------------ */
/*  Scene 1                                                            */
/* ------------------------------------------------------------------ */

function GalaxyScene({ name, hasDragged, onBegin }) {
  return (
    <motion.div
      className="scene scene-galaxy"
      variants={sceneVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="galaxy-head">
        <span className="eyebrow">
          <Orbit size={13} strokeWidth={1.6} aria-hidden="true" />
          kichkina bir olam
        </span>
      </div>

      <div className="galaxy-foot">
        <AnimatePresence initial={false}>
          {!hasDragged ? (
            <motion.div
              key="hint"
              className="hint"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={{ duration: 0.45, ease: easeOut }}
            >
              <Hand size={14} strokeWidth={1.6} aria-hidden="true" />
              Aylantirish uchun suring
            </motion.div>
          ) : null}
        </AnimatePresence>

        <PillButton icon={Sparkles} onClick={onBegin}>
          Boshlash
        </PillButton>

        <p className="micro">{name} uchun</p>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Scene 2                                                            */
/* ------------------------------------------------------------------ */

function NameScene({ introLine, onNext }) {
  return (
    <motion.div
      className="scene scene-name"
      variants={sceneVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="name-top">
        <span className="eyebrow">
          <Stars size={13} strokeWidth={1.6} aria-hidden="true" />
        твое имя сделано из звезд зная что ты солнце
        </span>
      </div>

      <motion.p
        className="name-line"
        initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ delay: 1.8, duration: 0.9, ease: easeOut }}
      >
        <Sparkles size={14} strokeWidth={1.7} aria-hidden="true" />
        {introLine}
      </motion.p>

      <motion.div
        className="name-actions"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.3, duration: 0.7, ease: easeOut }}
      >
        <PillButton icon={ArrowRight} onClick={onNext}>
          Keyingi
        </PillButton>
      </motion.div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Scene 3                                                            */
/* ------------------------------------------------------------------ */

function BloomTrigger({ chargeRef, enabled, onComplete }) {
  const [charging, setCharging] = useState(false)
  const ringRef = useRef(null)
  const glowRef = useRef(null)
  const startedRef = useRef(false)
  const doneRef = useRef(false)
  const completeRef = useRef(onComplete)

  useEffect(() => {
    completeRef.current = onComplete
  }, [onComplete])

  const radius = 64
  const circumference = 2 * Math.PI * radius

  useEffect(() => {
    let raf = 0
    let last = performance.now()

    const tick = (now) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000))
      last = now

      const current = chargeRef.current ?? 0
      const next =
        startedRef.current && !doneRef.current
          ? Math.min(1, current + dt * 1.25)
          : current
      chargeRef.current = next

      if (ringRef.current) {
        ringRef.current.style.strokeDashoffset = `${circumference * (1 - next)}`
      }
      if (glowRef.current) {
        glowRef.current.style.opacity = `${0.34 + next * 0.66}`
        glowRef.current.style.transform = `scale(${0.82 + next * 0.52})`
      }

      if (next >= 1 && !doneRef.current) {
        doneRef.current = true
        completeRef.current?.()
      }

      raf = window.requestAnimationFrame(tick)
    }

    raf = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(raf)
  }, [chargeRef, circumference])

  const trigger = () => {
    if (!enabled || startedRef.current) return
    startedRef.current = true
    setCharging(true)
    haptic(10)
  }

  return (
    <div className="hold-wrap">
      <div className={`hold${charging ? ' is-charging' : ''}`}>
        <motion.div
          className="orbit-ring orbit-ring--a"
          animate={{ rotate: 360 }}
          transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
          aria-hidden="true"
        >
          <span className="orbit-dot" />
        </motion.div>
        <motion.div
          className="orbit-ring orbit-ring--b"
          animate={{ rotate: -360 }}
          transition={{ duration: 38, repeat: Infinity, ease: 'linear' }}
          aria-hidden="true"
        >
          <span className="orbit-dot" />
        </motion.div>

        <button
          type="button"
          className="hold__button"
          onClick={trigger}
          onContextMenu={(event) => event.preventDefault()}
          aria-label="нажми чтобы рассцветала"
          disabled={!enabled}
        >
          <span className="hold__glow" ref={glowRef} aria-hidden="true" />
          <svg viewBox="0 0 200 200" className="hold__ring" aria-hidden="true">
            <defs>
              <linearGradient id="chargeGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F3C4D0" />
                <stop offset="55%" stopColor="#D98AA2" />
                <stop offset="100%" stopColor="#A9556F" />
              </linearGradient>
            </defs>
            <circle className="hold__track" cx="100" cy="100" r={radius} />
            <circle
              ref={ringRef}
              className="hold__progress"
              cx="100"
              cy="100"
              r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
            />
          </svg>
        </button>

        <p className="hold-hint" aria-live="polite">
          {charging ? 'рассцветает' : enabled ? 'нажми чтобы рассцветла' : 'yorug‘lik yig‘ilmoqda'}
        </p>
      </div>
    </div>
  )
}

function SurpriseScene({ phase, chargeRef, onBloom, onNext }) {
  const showHold = phase === 'gather' || phase === 'ready'
  const done = phase === 'done'

  return (
    <motion.div
      className="scene scene-surprise"
      variants={sceneVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="surprise-head">
        <span className="eyebrow">
          <Star size={13} strokeWidth={1.6} aria-hidden="true" />
          маленький ахалай махалай
        </span>
        <h2>
        знаю что это обычно но это от всей душы сделал бошка яна нма кберши блмадм
          <br />
        </h2>
      </div>

      <AnimatePresence>
        {showHold ? (
          <motion.div
            key="hold"
            className="hold-layer"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.08, filter: 'blur(6px)' }}
            transition={{ duration: 0.55, ease: easeOut }}
          >
            <BloomTrigger
              chargeRef={chargeRef}
              enabled={phase === 'ready'}
              onComplete={onBloom}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="surprise-foot">
        <AnimatePresence>
          {done ? (
            <motion.div
              key="done"
              className="bloom-done"
              initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, ease: easeOut }}
            >
              <p className="bloom-message">
                этот письмо о твоих минусов и плюсов про твой характер кооторые нравиться и не нравиться
              </p>
              <PillButton icon={Feather} onClick={onNext}>
                Keyingi
              </PillButton>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Scene 4 — letter                                                   */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */

function LetterScene({ letter, recipient, onRestart }) {
  const [opening, setOpening] = useState(false)
  const [opened, setOpened] = useState(false)
  const timerRef = useRef(0)

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  const openLetter = () => {
    if (opening) return
    setOpening(true)
    haptic([10, 28, 55])
    timerRef.current = window.setTimeout(() => setOpened(true), 1150)
  }

  return (
    <motion.div
      className="scene scene-letter"
      variants={sceneVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="letter-top">
        <span className="eyebrow">
          <Feather size={13} strokeWidth={1.6} aria-hidden="true" />
          {recipient} для тебя
        </span>
      </div>

      <div className="letter-stage">
        <div className={`letter-wrap${opening ? ' is-opening' : ''}`}>
          <div className="letter-sheet">
            <div className="letter-scroll">
              <motion.div
                className="letter-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: opening ? 1 : 0 }}
                transition={{
                  duration: 0.9,
                  delay: opening ? 0.46 : 0,
                  ease: easeOut,
                }}
              >
                <div className="letter-ornament" aria-hidden="true">
                  <span />
                  <Flower2 size={15} strokeWidth={1.4} />
                  <span />
                </div>

                <motion.h2
                  className="letter-title"
                  initial={{ opacity: 0, y: 12 }}
                  animate={
                    opening
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 12 }
                  }
                  transition={{
                    duration: 0.8,
                    delay: opening ? 0.62 : 0,
                    ease: easeOut,
                  }}
                >
                  {letter.title}
                </motion.h2>

                {letter.paragraphs.map((paragraph, paragraphIndex) => (
                  <motion.p
                    className="letter-p"
                    key={`${paragraphIndex}-${paragraph.slice(0, 12)}`}
                    initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
                    animate={
                      opening
                        ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                        : { opacity: 0, y: 14, filter: 'blur(4px)' }
                    }
                    transition={{
                      duration: 0.8,
                      delay: opening ? 0.82 + paragraphIndex * 0.3 : 0,
                      ease: easeOut,
                    }}
                  >
                    {paragraph}
                  </motion.p>
                ))}

                <motion.div
                  className="letter-signoff"
                  initial={{ opacity: 0, y: 12 }}
                  animate={opening ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                  transition={{
                    duration: 0.9,
                    delay: opening ? 0.95 + letter.paragraphs.length * 0.3 : 0,
                    ease: easeOut,
                  }}
                >
                  <span className="letter-flourish" aria-hidden="true">
                    ~
                  </span>
                  <p className="letter-signature">
                    {letter.signature}
                    <Heart size={10} strokeWidth={1.7} aria-hidden="true" />
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {!opened ? (
            <div className="letter-cover" aria-hidden={opening}>
              <motion.div
                className="flap flap--top"
                animate={
                  opening
                    ? { rotateX: -108, opacity: 0 }
                    : { rotateX: 0, opacity: 1 }
                }
                transition={{
                  duration: 0.95,
                  delay: opening ? 0.16 : 0,
                  ease: [0.62, 0.04, 0.24, 1],
                }}
              />
              <motion.div
                className="flap flap--bottom"
                animate={
                  opening
                    ? { rotateX: 108, opacity: 0 }
                    : { rotateX: 0, opacity: 1 }
                }
                transition={{
                  duration: 0.95,
                  delay: opening ? 0.22 : 0,
                  ease: [0.62, 0.04, 0.24, 1],
                }}
              />
              <button
                type="button"
                className="seal"
                onClick={openLetter}
                disabled={opening}
                aria-label="Xatni ochish"
              >
                <motion.span
                  className="seal__half seal__half--left"
                  animate={
                    opening
                      ? { x: -42, y: 28, rotate: -42, opacity: 0 }
                      : { x: 0, y: 0, rotate: 0, opacity: 1 }
                  }
                  transition={{ duration: 0.62, ease: easeOut }}
                >
                  {recipient.charAt(0).toUpperCase()}
                </motion.span>
                <motion.span
                  className="seal__half seal__half--right"
                  animate={
                    opening
                      ? { x: 42, y: 28, rotate: 42, opacity: 0 }
                      : { x: 0, y: 0, rotate: 0, opacity: 1 }
                  }
                  transition={{ duration: 0.62, ease: easeOut }}
                >
                  {recipient.charAt(0).toUpperCase()}
                </motion.span>
                <span className="seal__shine" aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="letter-foot">
        <AnimatePresence mode="wait" initial={false}>
          {!opening ? (
            <motion.p
              key="hint"
              className="open-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.55, 1, 0.55] }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Sparkles size={12} strokeWidth={1.6} aria-hidden="true" />
              Ochish uchun bos chikoo
            </motion.p>
          ) : opened ? (
            <motion.div
              key="again"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: easeOut }}
            >
              <PillButton variant="ghost" icon={RotateCcw} onClick={onRestart}>
                Yana o‘qish
              </PillButton>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  App                                                                */
/* ------------------------------------------------------------------ */

export default function App() {
  const [scene, setScene] = useState('galaxy')
  const [surprisePhase, setSurprisePhase] = useState('gather')
  const [hasDragged, setHasDragged] = useState(false)
  const chargeRef = useRef(0)

  const showCanvas =
    scene === 'galaxy' || scene === 'name' || scene === 'surprise'

  let particleMode = 'galaxy'
  if (scene === 'name') particleMode = 'name'
  else if (scene === 'surprise') {
    particleMode =
      surprisePhase === 'bloom' || surprisePhase === 'done' ? 'bloom' : 'seed'
  }

  useEffect(() => {
    if (scene !== 'surprise' || surprisePhase !== 'gather') return undefined
    const timer = window.setTimeout(() => setSurprisePhase('ready'), 1550)
    return () => window.clearTimeout(timer)
  }, [scene, surprisePhase])

  useEffect(() => {
    if (scene !== 'surprise' || surprisePhase !== 'bloom') return undefined
    const timer = window.setTimeout(() => setSurprisePhase('done'), 2150)
    return () => window.clearTimeout(timer)
  }, [scene, surprisePhase])

  const handleInteract = useCallback(() => setHasDragged(true), [])

  const bloom = useCallback(() => {
    setSurprisePhase('bloom')
    haptic([18, 40, 26, 60, 110])
  }, [])

  const goToSurprise = () => {
    chargeRef.current = 0
    setSurprisePhase('gather')
    setScene('surprise')
  }

  const restart = () => {
    chargeRef.current = 0
    setSurprisePhase('gather')
    setHasDragged(false)
    setScene('galaxy')
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="viewport">
        <div className="phone">
          <div className="phone-glow" aria-hidden="true" />
          <AmbientBackground />

          <AnimatePresence>
            {showCanvas ? (
              <motion.div
                key="particles"
                className="canvas-layer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.65, ease: easeOut }}
              >
                <ParticleField
                  mode={particleMode}
                  chargeRef={chargeRef}
                  onInteract={handleInteract}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {scene === 'galaxy' ? (
              <GalaxyScene
                key="galaxy"
                name={CONFIG.name}
                hasDragged={hasDragged}
                onBegin={() => setScene('name')}
              />
            ) : null}

            {scene === 'name' ? (
              <NameScene
                key="name"
                introLine={CONFIG.introLine}
                onNext={goToSurprise}
              />
            ) : null}

            {scene === 'surprise' ? (
              <SurpriseScene
                key="surprise"
                phase={surprisePhase}
                chargeRef={chargeRef}
                onBloom={bloom}
                onNext={() => setScene('letter')}
              />
            ) : null}

            {scene === 'letter' ? (
              <LetterScene
                key="letter"
                letter={CONFIG.letter}
                recipient={CONFIG.name}
                onRestart={restart}
              />
            ) : null}
          </AnimatePresence>

          <div className="grain" aria-hidden="true" />
          <div className="vignette" aria-hidden="true" />
        </div>
      </div>
    </MotionConfig>
  )
}

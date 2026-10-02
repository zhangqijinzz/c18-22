import type { BrandTokens } from '../models/brandMirrorModels'
import { SampleAnnotation, hotspot } from '../token-annotations/SampleAnnotation'
import { PRIMARY_TOKEN, SECONDARY_TOKEN, radiusToken, sampleTokens } from '../token-annotations/tokenCatalog'

export function PageGallery({ tokens }: { tokens: BrandTokens }) {
  return <section className="showcase-section page-showcase"><div className="showcase-heading"><div><span className="eyebrow">03 / PAGES</span><h2>页面样例</h2></div><span className="muted">同一套令牌的不同叙事</span></div><div className="page-grid"><LandingPage tokens={tokens} /><DashboardPage tokens={tokens} /></div></section>
}

function LandingPage({ tokens }: { tokens: BrandTokens }) {
  const sample = {
    id: 'page-landing',
    title: '营销落地页',
    tokenIds: sampleTokens(PRIMARY_TOKEN, SECONDARY_TOKEN, radiusToken(1), radiusToken(3)).map((token) => token.id),
  }
  return <article className="page-card landing-card annotated-card" style={{ borderRadius: tokens.radiusScale[3] }}><SampleAnnotation sample={sample} tokens={tokens} /><div className="page-top"><span className="mock-logo" style={{ color: tokens.primary }} {...hotspot(sample.id, PRIMARY_TOKEN.id)}>morrow<span>✦</span></span><span className="mock-nav">方法 / 案例 / 关于 / <b style={{ background: tokens.primary }} {...hotspot(sample.id, PRIMARY_TOKEN.id)}>预约咨询 ↗</b></span></div><div className="landing-copy"><span className="mini-kicker" style={{ color: tokens.primary }} {...hotspot(sample.id, PRIMARY_TOKEN.id)}>设计 · 策略 · 体验</span><h3>让复杂的事<br /><em style={{ color: tokens.primary }} {...hotspot(sample.id, PRIMARY_TOKEN.id)}>变得清晰</em></h3><p>我们帮助成长中的品牌，找到一套经得起时间推敲的表达方式。</p><button style={{ background: tokens.secondary, borderRadius: tokens.radiusScale[1] }} {...hotspot(sample.id, SECONDARY_TOKEN.id, [radiusToken(1).id])}>看看我们如何做 <span>→</span></button></div><div className="landing-orb" style={{ background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.secondary})`, borderRadius: tokens.radiusScale[3] }} {...hotspot(sample.id, PRIMARY_TOKEN.id, [SECONDARY_TOKEN.id, radiusToken(3).id])}><span>m</span></div></article>
}

function DashboardPage({ tokens }: { tokens: BrandTokens }) {
  const sample = {
    id: 'page-dashboard',
    title: '数据看板',
    tokenIds: sampleTokens(PRIMARY_TOKEN, SECONDARY_TOKEN, radiusToken(0), radiusToken(3)).map((token) => token.id),
  }
  return <article className="page-card dashboard-card annotated-card" style={{ borderRadius: tokens.radiusScale[3] }}><SampleAnnotation sample={sample} tokens={tokens} /><div className="dash-sidebar"><span className="dash-brand" style={{ color: tokens.primary }} {...hotspot(sample.id, PRIMARY_TOKEN.id)}>B.</span><span className="dash-active" style={{ background: `${tokens.primary}18`, color: tokens.primary }} {...hotspot(sample.id, PRIMARY_TOKEN.id)}>▦ / 概览</span><span>◫ / 项目</span><span>◌ / 成员</span><span>⚙ / 设置</span></div><div className="dash-main"><div className="dash-title"><span>周一，9月 30日</span><b>你好，Mina <span className="dash-emoji">✦</span></b><span className="dash-avatar" style={{ background: tokens.secondary }} {...hotspot(sample.id, SECONDARY_TOKEN.id)}>M</span></div><div className="dash-stat-grid"><div><small>本月完成</small><strong>24</strong><span style={{ color: tokens.primary }} {...hotspot(sample.id, PRIMARY_TOKEN.id)}>↑ 18.2%</span></div><div><small>活跃项目</small><strong>08</strong><span className="soft-green">稳定</span></div><div><small>团队专注度</small><strong>86%</strong><span style={{ color: tokens.primary }} {...hotspot(sample.id, PRIMARY_TOKEN.id)}>↑ 4.1%</span></div></div><div className="dash-chart"><div className="chart-head"><b>项目节奏</b><span>近 7 天 / ⌄</span></div><div className="chart-bars">{[45, 68, 52, 80, 62, 88, 73].map((height, index) => <i key={index} style={{ height: `${height}%`, background: index === 5 ? tokens.primary : `${tokens.primary}30`, borderRadius: `${tokens.radiusScale[0]}px ${tokens.radiusScale[0]}px 0 0` }} {...hotspot(sample.id, PRIMARY_TOKEN.id, [radiusToken(0).id])} />)}</div></div></div></article>
}

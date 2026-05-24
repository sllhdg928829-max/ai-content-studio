"""一键自动化内容赚钱管道

用法:
  python run_pipeline.py                   # 完整管道：研究→生成→保存
  python run_pipeline.py --quick            # 快速模式：用预设关键词直接生成
  python run_pipeline.py --test             # 测试模式：生成1篇测试文章
"""

import os
import sys
import json
import asyncio
import httpx
from datetime import datetime
from config import DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, OUTPUT_DIR

# ============================================================
# 预设高价值利基市场（已验证的高CPC关键词）
# ============================================================
PRESET_NICHES = [
    {
        "name": "AI工具评测",
        "keywords": ["AI工具推荐", "人工智能软件", "AI写作工具", "ChatGPT替代品", "AI绘画工具"],
        "content_ideas": [
            "2025年最好的10个AI写作工具对比评测",
            "免费AI绘画工具推荐：零基础也能画出专业插画",
            "AI编程助手哪家强？GitHub Copilot vs Cursor深度对比",
            "小企业必备的5个AI效率工具，月省100小时",
        ],
        "affiliate_programs": ["各大AI工具联盟", "AppSumo", "软件订阅佣金"],
    },
    {
        "name": "远程工作效率",
        "keywords": ["远程办公", "在家工作", "时间管理", "效率工具", "数字游民"],
        "content_ideas": [
            "远程工作者的10个必备效率工具",
            "在家办公如何保持专注？科学验证的5个方法",
            "数字游民生活方式指南：如何边旅行边赚钱",
            "时间管理终极指南：番茄工作法vs GTD哪个更适合你",
        ],
        "affiliate_programs": ["Notion", "Todoist", "Trello", "各类工具佣金"],
    },
    {
        "name": "健康与健身科技",
        "keywords": ["智能手表", "健身追踪", "健康监测", "运动科技", "睡眠改善"],
        "content_ideas": [
            "智能手表选购指南：苹果vs华为vs小米全面对比",
            "睡眠追踪器实测：谁才是助眠神器",
            "居家健身设备推荐：1000元打造家庭健身房",
            "健身APP测评：Keep vs Nike vs Peloton",
        ],
        "affiliate_programs": ["京东联盟", "淘宝客", "各品牌佣金"],
    },
    {
        "name": "个人理财与副业",
        "keywords": ["理财产品", "基金定投", "副业赚钱", "被动收入", "理财入门"],
        "content_ideas": [
            "2025年最适合新手的5种低风险理财方式",
            "月薪5000如何开始投资？从零开始的理财之路",
            "10个可以周末做的副业，月入额外3000元",
            "被动收入入门指南：不工作也能赚钱的5种方法",
        ],
        "affiliate_programs": ["理财课程佣金", "券商开户佣金", "书籍推荐"],
    },
]


async def generate_article(topic, keywords, niche_name, language="zh"):
    """生成单篇文章"""
    kw_str = ", ".join(keywords[:5])

    prompt = f"""请用中文撰写一篇关于"{topic}"的高质量博客文章。
利基领域：{niche_name}
SEO关键词：{kw_str}

要求：
1. 标题吸引人、包含主关键词
2. 开头引言抓住读者
3. 3-5个小标题(H2)，每段200-400字实质内容
4. 原创、有价值、可操作的具体建议
5. 结尾总结+行动号召
6. 总长度1500-2500字
7. 自然地融入SEO关键词
8. 适当加入产品推荐（可用于联盟营销）

以JSON格式返回：
{{
  "title": "文章标题",
  "slug": "english-url-slug",
  "meta_description": "150-160字的SEO摘要描述",
  "tags": ["标签1", "标签2"],
  "content": "完整的HTML格式文章（<h2>、<p>、<ul><li>标签）",
  "word_count": 估计字数
}}"""

    async with httpx.AsyncClient(timeout=180.0) as client:
        resp = await client.post(
            f"{DEEPSEEK_BASE_URL}/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "deepseek-chat",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.8,
                "max_tokens": 4096,
            },
        )

    data = resp.json()
    if "choices" not in data:
        raise Exception(f"API error: {data}")

    raw = data["choices"][0]["message"]["content"]

    # 尝试提取JSON
    try:
        article = json.loads(raw)
    except json.JSONDecodeError:
        if "```json" in raw:
            raw = raw.split("```json")[1].split("```")[0]
        elif "```" in raw:
            raw = raw.split("```")[1].split("```")[0]
        article = json.loads(raw)

    article["niche"] = niche_name
    article["generated_at"] = datetime.utcnow().isoformat()
    article["topic"] = topic
    return article


def save_article(article, output_dir):
    """保存文章为HTML文件"""
    slug = article.get("slug", article.get("topic", "article").replace(" ", "-")[:50])
    niche_slug = article["niche"].replace(" ", "-").lower()
    niche_dir = os.path.join(output_dir, niche_slug)
    os.makedirs(niche_dir, exist_ok=True)

    # 生成带SEO元数据的HTML
    html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{article.get('meta_description', article.get('title', ''))}">
    <meta name="keywords" content="{', '.join(article.get('tags', []))}">
    <title>{article.get('title', 'Untitled')}</title>
    <style>
        :root {{ --text: #333; --bg: #fff; --accent: #6366f1; }}
        body {{ max-width:800px; margin:0 auto; padding:20px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; line-height:1.8; color:var(--text); background:var(--bg); }}
        h1 {{ font-size:2em; margin-bottom:.3em; color:#111; }}
        h2 {{ font-size:1.4em; margin-top:2em; color:#444; border-bottom:2px solid var(--accent); padding-bottom:.3em; }}
        p {{ margin:1em 0; }}
        .meta {{ color:#999; font-size:.85em; margin-bottom:2em; }}
        .tags {{ margin-top:3em; padding-top:1em; border-top:1px solid #eee; }}
        .tags span {{ display:inline-block; background:#f0f0f0; padding:4px 12px; border-radius:20px; margin:4px; font-size:.85em; }}
        .cta {{ margin-top:2em; padding:20px; background:linear-gradient(135deg,#667eea,#764ba2); color:#fff; border-radius:12px; text-align:center; }}
        .cta a {{ color:#fff; }}
        @media(max-width:600px) {{ body{{padding:15px;}} h1{{font-size:1.5em;}} }}
    </style>
</head>
<body>
    <h1>{article.get('title', 'Untitled')}</h1>
    <div class="meta">发布: {article.get('generated_at', '')[:10]} | 分类: {article.get('niche', '')} | 字数: {article.get('word_count', 'N/A')}</div>
    {article.get('content', '')}
    <div class="cta">
        <h3>觉得有用？分享给朋友</h3>
        <p>如果你喜欢这篇文章，请分享给更多人！</p>
    </div>
    <div class="tags">{' '.join(f'<span>{tag}</span>' for tag in article.get('tags', []))}</div>
</body>
</html>"""

    filepath = os.path.join(niche_dir, f"{slug}.html")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(html)

    return filepath


async def run_pipeline(niches=None, articles_per_niche=2, output_dir=None):
    """运行完整管道"""
    if output_dir is None:
        output_dir = OUTPUT_DIR

    if niches is None:
        niches = PRESET_NICHES[:3]  # 默认用前3个利基

    total = 0
    for niche in niches:
        niche_name = niche["name"]
        print(f"\n{'='*60}")
        print(f"利基: {niche_name}")
        print(f"  Keywords: {', '.join(niche['keywords'][:3])}")
        print(f"  Affiliate: {', '.join(niche.get('affiliate_programs', ['通用']))}")
        print(f"{'='*60}")

        for i, idea in enumerate(niche["content_ideas"][:articles_per_niche], 1):
            print(f"\n  [{i}/{min(articles_per_niche, len(niche['content_ideas']))}] {idea}")
            try:
                article = await generate_article(idea, niche["keywords"], niche_name)
                filepath = save_article(article, output_dir)
                total += 1
                print(f"  ✓ 已保存: {filepath}")
                print(f"    标题: {article.get('title', '')[:60]}...")
            except Exception as e:
                print(f"  ✗ 失败: {e}")

    print(f"\n{'='*60}")
    print(f"完成！共生成 {total} 篇文章")
    print(f"保存位置: {os.path.abspath(output_dir)}")
    print(f"{'='*60}")


async def main():
    if "--test" in sys.argv:
        print("测试模式：生成1篇文章\n")
        niche = PRESET_NICHES[0]
        article = await generate_article(
            PRESET_NICHES[0]["content_ideas"][0],
            PRESET_NICHES[0]["keywords"],
            PRESET_NICHES[0]["name"],
        )
        filepath = save_article(article, OUTPUT_DIR)
        print(f"✓ 测试文章已保存: {filepath}")
        print(f"  标题: {article.get('title')}")
    elif "--full" in sys.argv:
        await run_pipeline(PRESET_NICHES, articles_per_niche=4)
    else:
        await run_pipeline()


if __name__ == "__main__":
    asyncio.run(main())

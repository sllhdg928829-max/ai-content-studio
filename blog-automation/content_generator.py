"""Automated blog content generation pipeline."""

import os
import json
import httpx
from datetime import datetime
from config import DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, OUTPUT_DIR


async def generate_article(topic: str, keywords: list[str], niche: str, language: str = "zh") -> dict:
    lang_instruction = "用中文写作" if language == "zh" else "Write in English"
    kw_str = ", ".join(keywords)

    prompt = f"""请{lang_instruction}一篇关于"{topic}"的高质量博客文章。

这是"{niche}"领域的文章。
SEO关键词：{kw_str}

要求：
1. 标题要吸引人，包含主关键词
2. 开头要有引言抓住读者
3. 正文3-5个小标题（H2），每个小标题下200-400字
4. 内容原创、有价值、可操作
5. 结尾有总结和行动号召
6. 1500-2500字
7. 自然融入SEO关键词

请以JSON格式返回：
{{
  "title": "文章标题",
  "slug": "url-friendly-slug",
  "meta_description": "150-160字的SEO描述",
  "tags": ["标签1", "标签2"],
  "content": "完整的HTML格式文章内容（使用<h2>、<p>、<ul>等标签）",
  "word_count": 字数
}}
"""
    async with httpx.AsyncClient(timeout=180.0) as client:
        response = await client.post(
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
    data = response.json()
    content = data["choices"][0]["message"]["content"]

    try:
        article = json.loads(content)
    except json.JSONDecodeError:
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]
        article = json.loads(content)

    return article


async def generate_articles_for_niche(niche: dict, num_articles: int = 5):
    """Generate multiple articles for a niche."""
    articles = []
    niche_name = niche["name"]
    content_ideas = niche.get("content_ideas", [])
    keywords = niche.get("keywords", [])

    for i, idea in enumerate(content_ideas[:num_articles]):
        print(f"  Generating article {i+1}/{min(num_articles, len(content_ideas))}: {idea}")
        try:
            article = await generate_article(
                topic=idea,
                keywords=keywords[:5] + [niche_name],
                niche=niche_name,
            )
            article["niche"] = niche_name
            article["generated_at"] = datetime.utcnow().isoformat()
            articles.append(article)
            print(f"  ✓ Generated: {article.get('title', 'Untitled')}")
        except Exception as e:
            print(f"  ✗ Failed: {e}")

    return articles


def save_articles(articles: list[dict], niche_slug: str):
    """Save generated articles to the output directory."""
    niche_dir = os.path.join(OUTPUT_DIR, niche_slug)
    os.makedirs(niche_dir, exist_ok=True)

    for article in articles:
        slug = article.get("slug", "article")
        filepath = os.path.join(niche_dir, f"{slug}.html")

        html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{article.get('meta_description', '')}">
    <title>{article.get('title', 'Untitled')}</title>
    <style>
        body {{
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.8;
            color: #333;
        }}
        h1 {{ font-size: 2em; margin-bottom: 0.5em; }}
        h2 {{ font-size: 1.4em; margin-top: 1.5em; color: #555; }}
        p {{ margin: 1em 0; }}
        .meta {{ color: #999; font-size: 0.9em; margin-bottom: 2em; }}
        .tags {{ margin-top: 2em; }}
        .tags span {{
            display: inline-block;
            background: #f0f0f0;
            padding: 4px 12px;
            border-radius: 20px;
            margin: 4px;
            font-size: 0.9em;
        }}
    </style>
</head>
<body>
    <h1>{article.get('title', 'Untitled')}</h1>
    <div class="meta">
        Generated: {article.get('generated_at', '')} |
        Niche: {article.get('niche', '')}
    </div>
    {article.get('content', '')}
    <div class="tags">
        {' '.join(f'<span>{tag}</span>' for tag in article.get('tags', []))}
    </div>
</body>
</html>"""

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"  Saved: {filepath}")


async def main():
    # Load niche research results
    if os.path.exists("niche_report.json"):
        with open("niche_report.json", "r", encoding="utf-8") as f:
            niches = json.load(f)
    else:
        print("No niche_report.json found. Run niche_research.py first.")
        return

    print(f"Generating articles for {len(niches)} niches...\n")

    for niche in niches[:3]:  # Start with top 3 niches
        niche_slug = niche["name"].lower().replace(" ", "-")
        print(f"\n=== {niche['name']} ===")
        articles = await generate_articles_for_niche(niche, num_articles=3)
        if articles:
            save_articles(articles, niche_slug)

    print(f"\nDone! Articles saved to {OUTPUT_DIR}/")


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())

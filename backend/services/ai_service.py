import httpx
from config import settings

SYSTEM_PROMPT = """你是一个专业的内容创作AI助手。你的任务是根据用户的需求生成高质量的内容。

要求：
1. 内容必须原创、有价值、吸引读者
2. 根据指定的内容类型采用合适的格式和风格
3. 使用恰当的标题、段落结构和排版
4. 如果是中文内容，确保语言流畅自然
5. 如果是英文内容，确保语法正确、表达地道
6. 包含适当的SEO关键词优化
7. 在合适的地方加入行动号召(CTA)
"""

CONTENT_PROMPTS = {
    "blog": """请生成一篇关于"{topic}"的博客文章。
关键词：{keywords}
语气风格：{tone}
长度：{length}
{extra}

请包含：
- 一个吸引人的标题（H1）
- 3-5个小标题（H2）
- 每个段落要有实质内容
- 开头要有引言抓住读者
- 结尾要有总结和行动号召""",

    "social_media": """请为"{topic}"生成社交媒体帖子。
平台风格：适合小红书/微博/朋友圈
语气风格：{tone}
长度：{length}
{extra}

请生成3个版本的帖子：
1. 短帖（适合微博/朋友圈，100字左右）
2. 中帖（适合小红书，300-500字，带emoji和话题标签）
3. 长帖（适合深度分享，800字左右）""",

    "ad_copy": """请为"{topic}"撰写广告文案。
语气风格：{tone}
长度：{length}
{extra}

请包含：
1. 一个抓眼球的标题
2. 痛点分析
3. 产品/服务卖点
4. 信任背书
5. 限时优惠/行动号召""",

    "product_desc": """请为"{topic}"撰写产品描述。
语气风格：{tone}
长度：{length}
{extra}

请包含：
1. 产品名称和一句话简介
2. 核心卖点（3-5个）
3. 详细产品描述
4. 规格参数（如适用）
5. 适用场景/人群
6. 购买理由""",

    "email": """请撰写一封关于"{topic}"的营销邮件。
语气风格：{tone}
长度：{length}
{extra}

请包含：
1. 吸引人的邮件标题（Subject Line）
2. 个性化的开场问候
3. 核心内容
4. CTA按钮文案
5. 退订说明""",

    "seo": """请为关键词"{topic}"生成SEO优化内容。
相关关键词：{keywords}
语气风格：{tone}
长度：{length}
{extra}

请生成：
1. SEO标题（包含主关键词，50-60字符）
2. Meta描述（包含关键词，150-160字符）
3. 10-15个相关长尾关键词
4. 一篇SEO优化的长文
5. 内部链接建议""",
}

LENGTH_MAP = {
    "short": "简短精炼，约200-500字",
    "medium": "中等长度，约800-1500字",
    "long": "详细全面，约2000-3000字",
}


async def generate_content(
    content_type: str,
    topic: str,
    keywords: str = "",
    tone: str = "professional",
    language: str = "zh",
    length: str = "medium",
    extra_instructions: str = "",
) -> str:
    prompt_template = CONTENT_PROMPTS.get(content_type, CONTENT_PROMPTS["blog"])
    length_desc = LENGTH_MAP.get(length, LENGTH_MAP["medium"])

    prompt = prompt_template.format(
        topic=topic,
        keywords=keywords or topic,
        tone=tone,
        length=length_desc,
        extra=f"额外要求：{extra_instructions}" if extra_instructions else "",
    )

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{settings.DEEPSEEK_BASE_URL}/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "deepseek-chat",
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.8,
                "max_tokens": 4096,
            },
        )
        data = response.json()

    if "choices" not in data:
        error_msg = data.get("error", {}).get("message", str(data))
        raise Exception(f"AI generation failed: {error_msg}")

    return data["choices"][0]["message"]["content"]

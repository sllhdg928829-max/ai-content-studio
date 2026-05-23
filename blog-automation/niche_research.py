"""Automated niche research - finds profitable blog niches using AI analysis."""

import json
import httpx
from config import DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, NICHES_TO_RESEARCH


async def research_niches():
    prompt = f"""你是一个专业的利基市场研究分析师。请分析当前互联网上最有赚钱潜力的博客利基市场。

要求：
1. 列出{NICHES_TO_RESEARCH}个利基市场
2. 每个利基需要包含：名称、目标受众、竞争程度(低/中/高)、广告CPC(预估美元)、联盟营销潜力(1-10分)、内容创意(3-5个标题)

请以JSON格式返回，格式如下：
{{
  "niches": [
    {{
      "name": "利基名称",
      "audience": "目标受众描述",
      "competition": "low/medium/high",
      "estimated_cpc": "$1.50",
      "affiliate_potential": 8,
      "content_ideas": ["标题1", "标题2", "标题3"],
      "keywords": ["关键词1", "关键词2"]
    }}
  ]
}}
"""
    async with httpx.AsyncClient(timeout=120.0) as client:
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

    # Extract JSON from the response
    try:
        # Try direct JSON parse
        result = json.loads(content)
    except json.JSONDecodeError:
        # Try to extract JSON from code blocks
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]
        result = json.loads(content)

    return result.get("niches", [])


async def main():
    niches = await research_niches()
    print(f"Found {len(niches)} niche opportunities:\n")
    for i, niche in enumerate(niches, 1):
        print(f"{i}. {niche['name']}")
        print(f"   Audience: {niche['audience']}")
        print(f"   Competition: {niche['competition']}")
        print(f"   Est. CPC: {niche['estimated_cpc']}")
        print(f"   Affiliate Potential: {niche['affiliate_potential']}/10")
        print(f"   Content Ideas: {', '.join(niche['content_ideas'][:3])}")
        print()

    # Save results
    with open("niche_report.json", "w", encoding="utf-8") as f:
        json.dump(niches, f, ensure_ascii=False, indent=2)
    print(f"Report saved to niche_report.json")


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())

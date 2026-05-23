import os

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_BASE_URL = "https://api.deepseek.com"

# Niche research settings
NICHES_TO_RESEARCH = 10
ARTICLES_PER_NICHE = 5

# Blog settings
BLOG_NAME = "Smart Living Guide"
BLOG_DESCRIPTION = "Your guide to smarter living with technology, productivity, and lifestyle tips"
OUTPUT_DIR = "./output"

# SEO settings
TARGET_LANGUAGES = ["zh", "en"]

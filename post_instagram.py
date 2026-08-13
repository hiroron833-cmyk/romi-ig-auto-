import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

ACCESS_TOKEN = os.environ["IG_ACCESS_TOKEN"]
IG_USER_ID = os.environ["IG_USER_ID"]
REPO = os.environ["GITHUB_REPOSITORY"]
BRANCH = os.environ.get("GITHUB_REF_NAME", "main")
GRAPH_API = "https://graph.instagram.com/v23.0"


def api_post(path, params):
    url = f"{GRAPH_API}/{path}"
    data = urllib.parse.urlencode(params).encode()
    req = urllib.request.Request(url, data=data, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        raise RuntimeError(f"Instagram API error ({e.code}): {body}") from e


def image_url(filename):
    return f"https://raw.githubusercontent.com/{REPO}/{BRANCH}/images/{filename}"


def create_carousel_item(filename):
    result = api_post(
        f"{IG_USER_ID}/media",
        {
            "image_url": image_url(filename),
            "is_carousel_item": "true",
            "access_token": ACCESS_TOKEN,
        },
    )
    return result["id"]


def create_carousel_container(children_ids, caption):
    result = api_post(
        f"{IG_USER_ID}/media",
        {
            "media_type": "CAROUSEL",
            "children": ",".join(children_ids),
            "caption": caption,
            "access_token": ACCESS_TOKEN,
        },
    )
    return result["id"]


def publish(container_id):
    return api_post(
        f"{IG_USER_ID}/media_publish",
        {
            "creation_id": container_id,
            "access_token": ACCESS_TOKEN,
        },
    )


def main():
    with open("schedule.json", encoding="utf-8") as f:
        posts = json.load(f)

    jst = timezone(timedelta(hours=9))
    today = datetime.now(jst).strftime("%Y-%m-%d")

    todays_posts = [p for p in posts if p["date"] == today]
    if not todays_posts:
        print(f"No Instagram post scheduled for {today}. Nothing to do.")
        return

    for post in todays_posts:
        print(f"Posting for {post['date']}...")
        children = []
        for filename in post["images"]:
            item_id = create_carousel_item(filename)
            print(f"  created item {item_id} for {filename}")
            children.append(item_id)
            time.sleep(2)

        container_id = create_carousel_container(children, post["caption"])
        print(f"  created carousel container {container_id}")
        time.sleep(5)

        result = publish(container_id)
        print(f"  published: {result}")


if __name__ == "__main__":
    main()

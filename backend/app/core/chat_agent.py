import requests
from bs4 import BeautifulSoup
from duckduckgo_search import DDGS
from google import genai

MODEL = "gemini-2.5-flash"


class ChatAgent:
    def __init__(self, api_key: str):
        self.client = genai.Client(api_key=api_key)

    def search_web(self, query: str, max_results: int = 3):
        try:
            print(f"Searching web for: {query}")
            # Try specific backend if default fails, or catch specific exceptions
            with DDGS() as ddgs:
                results = list(ddgs.text(query, max_results=max_results))
                print(f"Found {len(results)} results")
                return results
        except Exception as e:
            print(f"Error searching web: {e}")
            return []

    def scrape_url(self, url: str) -> str:
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")

            for script in soup(["script", "style"]):
                script.decompose()

            text = soup.get_text()

            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = "\n".join(chunk for chunk in chunks if chunk)

            return text
        except Exception as e:
            print(f"Failed to scrape {url}: {e}")
            return ""

    def generate_response(
        self, user_query: str, history: list[dict] = []
    ) -> tuple[str, list[str]]:
        chat_session = self.client.chats.create(model=MODEL, history=history)
        search_results = self.search_web(user_query)
        context_data = []
        sources = []

        for result in search_results:
            url = result.get("href")
            title = result.get("title")
            sources.append(url)

            content = self.scrape_url(url)
            if content:
                context_data.append(
                    f"SOURCE: {title} ({url})\nCONTENT:\n{content[:20000]}\n"
                )

        full_context = "\n".join(context_data)

        prompt = f"""
        Instructions:
        You are an expert Python programming assistant. Your goal is to help users write, debug, and understand Python code and general programming concepts applied in Python.

        ### Instructions
        1.  **Context Usage:** Answer the user's question based on the provided Context and the conversation history. If the context doesn't help, rely on your internal knowledge.
        2.  **Scope:**
            * Answer questions strictly related to the Python programming language (syntax, libraries, frameworks like Django/Flask/Pandas).
            * Answer general programming questions (algorithms, data structures, design patterns, architecture) ONLY if they are applicable to Python. Explain these concepts using Python examples.
            * If a user asks how to solve a real-world problem (e.g., math, finance), ONLY answer if you can provide a Python implementation or logic for it.

        ### Constraints & Refusal
        You must strictly refuse to answer in the following cases:
        * Questions about programming languages other than Python (unless comparing them to Python).
        * General knowledge questions unrelated to programming or code implementation.
        * Requests to generate non-code content (e.g., creative writing, essays) unless it's string data for a Python script.

        If the user's input violates these constraints, reply with the exact message:
        "Please provide Python or programming-related questions only."

        ---
        
        CONTEXT FROM WEB SEARCH:
        <context>
        {full_context}
        </context>

        USER QUESTION:
        <user_query>
        {user_query}
        </user_query>
        """

        try:
            response = chat_session.send_message(prompt)
            return response.text, sources
        except Exception as e:
            return f"Error generating response: {e}", []

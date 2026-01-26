import requests
from bs4 import BeautifulSoup
from duckduckgo_search import DDGS
import google.generativeai as genai

MODEL = "gemini-2.5-flash"

class ChatAgent:
    
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(MODEL)

    def search_web(self, query: str, max_results: int = 3):
        try:
            with DDGS() as ddgs:
                results = list(ddgs.text(query, max_results=max_results))
                return results
        except Exception as e:
            print(f"Error searching web: {e}")
            return []

    def scrape_url(self, url: str) -> str:
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')

            for script in soup(["script", "style"]):
                script.decompose()
            
            text = soup.get_text()
            
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = '\n'.join(chunk for chunk in chunks if chunk)
            
            return text
        except Exception as e:
            print(f"Failed to scrape {url}: {e}")
            return ""

    def generate_response(self, user_query: str, history: list[dict] = []) -> str:
        chat_session = self.model.start_chat(history=history)
        search_results = self.search_web(user_query)
        context_data = []
        
        for result in search_results:
            url = result.get('href')
            title = result.get('title')
            print(f"Scraping: {title} ({url})")
            
            content = self.scrape_url(url)
            if content:
                context_data.append(f"SOURCE: {title} ({url})\nCONTENT:\n{content[:20000]}\n")

        full_context = "\n".join(context_data)

        prompt = f"""
        CONTEXT FROM WEB SEARCH:
        {full_context}
        
        USER QUESTION: 
        {user_query}
        
        Instructions:
        Answer the user's question based on the provided Context and the conversation history.
        If the context doesn't help, rely on your knowledge.
        Refuse non-Python programming questions.
        """

        try:
            response = chat_session.send_message(prompt)
            return response.text
        except Exception as e:
            return f"Error generating response: {e}"

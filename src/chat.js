/**
 * Отправляет запрос на бэкенд и возвращает ответ.
 *
 * @param {string} question — текст вопроса
 * @param {Array<{ question: string, answer: string }>} [history=[]] — история диалога
 * @returns {Promise<{
*   answer: string,
*   source_documents: Array<{ source: string; chunk_id: number }>
* }>}
* @throws {Error} — если fetch завершился неуспешно или в ответе пришла ошибка
*/
export async function sendMessage(question, history = []) {
 let res, payload;
 
 try {
   res = await fetch('http://localhost:8000/chat', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ question, history }),
   });
 } catch (networkError) {
   console.error('Network error in sendMessage:', networkError);
   throw new Error('Не удалось соединиться с сервером');
 }

 // Попытаемся распарсить JSON-ответ
 try {
   payload = await res.json();
 } catch (parseError) {
   console.error('Failed to parse JSON:', parseError);
   throw new Error(`Сервер вернул некорректный ответ (status ${res.status})`);
 }

 // Если статус не OK — выкидываем ошибку с сообщением из тела, если есть
 if (!res.ok) {
   const msg = payload.error ?? res.statusText ?? `Ошибка ${res.status}`;
   throw new Error(msg);
 }

 // Всё хорошо — возвращаем готовый результат
 return {
   answer: payload.answer,
   source_documents: payload.source_documents || [],
 };
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("http://localhost:8000/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Ошибка загрузки файла");
  }

  return await res.json();
}

export async function fetchChatHistory() {
  const res = await fetch("http://localhost:8000/history");

  if (!res.ok) {
    throw new Error("Ошибка получения истории чата");
  }

  return await res.json();
}

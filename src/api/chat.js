/**
 * Отправляет запрос на бэкенд и возвращает ответ.
 *
 * @param {string} question — текст вопроса
 * @param {Array<string>} [history=[]] — массив: [вопрос1, ответ1, вопрос2, ответ2, ...]
 * @returns {Promise<{ answer: string, source_documents: Array<{ source: string; chunk_id: number }> }>}
 */
export async function sendMessage(question, history = []) {
  let res, payload;

  // Преобразуем массив строк в пары вопрос/ответ
  const formattedHistory = [];
  for (let i = 0; i < history.length - 1; i += 2) {
    if (typeof history[i] === 'string' && typeof history[i + 1] === 'string') {
      formattedHistory.push({
        question: history[i],
        answer: history[i + 1],
      });
    }
  }

  try {
    res = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, history: formattedHistory }),
    });
  } catch (networkError) {
    console.error('Network error in sendMessage:', networkError);
    throw new Error('Не удалось соединиться с сервером');
  }

  try {
    payload = await res.json();
  } catch (parseError) {
    console.error('Failed to parse JSON:', parseError);
    throw new Error(`Сервер вернул некорректный ответ (status ${res.status})`);
  }

  if (!res.ok) {
    const msg = payload.error ?? res.statusText ?? `Ошибка ${res.status}`;
    throw new Error(msg);
  }

  return {
    answer: payload.answer,
    source_documents: payload.source_documents || [],
  };
}

/**
 * Отправляет POST-запрос на очистку чата и памяти
 */
export async function clearChat() {
  const res = await fetch('http://localhost:8000/clear', {
    method: 'POST',
  });

  if (!res.ok) {
    throw new Error('Ошибка очистки чата');
  }
}

/**
 * Загружает файл и возвращает автоответ
 *
 * @param {File} file — загружаемый файл
 * @returns {Promise<{ message: string, auto_question: string, auto_answer: string }>}
 */
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('http://localhost:8000/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Ошибка загрузки файла');
  }

  return data;
}

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaBold, FaItalic, FaUnderline, FaHeading, FaListUl, FaListOl, FaImage, FaLink, FaCode } from 'react-icons/fa';

/**
 * Prosty edytor tekstu ze wsparciem formatowania
 */
const TextEditor = ({ initialContent, onUpdate }) => {
  // Stan lokalny
  const [content, setContent] = useState(initialContent || '');
  const [showImageModal, setShowImageModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);

  // Zaktualizuj stan lokalny gdy zmieni się initialContent
  useEffect(() => {
    setContent(initialContent || '');
  }, [initialContent]);

  // Funkcja aktualizująca zawartość
  const handleChange = (e) => {
    setContent(e.target.value);
    onUpdate(e.target.value);
  };

  // Zapisz pozycję kursora
  const handleSelect = (e) => {
    setSelectionStart(e.target.selectionStart);
    setSelectionEnd(e.target.selectionEnd);
  };

  // Wstawianie formatowania
  const insertFormatting = (startMark, endMark) => {
    const textarea = document.getElementById('text-editor');
    
    if (!textarea) return;
    
    const start = selectionStart;
    const end = selectionEnd;
    const selectedText = content.substring(start, end);
    
    // Nowa zawartość z formatowaniem
    const newContent = 
      content.substring(0, start) + 
      startMark + 
      selectedText + 
      endMark + 
      content.substring(end);
    
    // Aktualizuj stan
    setContent(newContent);
    onUpdate(newContent);
    
    // Przywróć fokus i ustaw kursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + startMark.length, 
        end + startMark.length
      );
    }, 0);
  };

  // Obsługa przycisków formatowania
  const handleBold = () => insertFormatting('**', '**');
  const handleItalic = () => insertFormatting('*', '*');
  const handleUnderline = () => insertFormatting('__', '__');
  const handleHeading = () => insertFormatting('## ', '');
  const handleUnorderedList = () => insertFormatting('- ', '');
  const handleOrderedList = () => insertFormatting('1. ', '');
  const handleCode = () => insertFormatting('`', '`');

  // Obsługa wstawiania obrazu
  const handleImageInsert = () => {
    if (!imageUrl) return;
    
    const imageMarkdown = `![${imageAlt}](${imageUrl})`;
    
    const newContent = 
      content.substring(0, selectionStart) + 
      imageMarkdown + 
      content.substring(selectionEnd);
    
    // Aktualizuj stan
    setContent(newContent);
    onUpdate(newContent);
    
    // Zamknij modal
    setShowImageModal(false);
    setImageUrl('');
    setImageAlt('');
  };

  // Obsługa wstawiania linku
  const handleLinkInsert = () => {
    if (!linkUrl) return;
    
    let linkMarkdown;
    
    if (linkText) {
      linkMarkdown = `[${linkText}](${linkUrl})`;
    } else {
      linkMarkdown = `<${linkUrl}>`;
    }
    
    const newContent = 
      content.substring(0, selectionStart) + 
      linkMarkdown + 
      content.substring(selectionEnd);
    
    // Aktualizuj stan
    setContent(newContent);
    onUpdate(newContent);
    
    // Zamknij modal
    setShowLinkModal(false);
    setLinkUrl('');
    setLinkText('');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Pasek narzędziowy */}
      <div className="bg-gray-100 p-2 flex items-center space-x-1 dark:bg-gray-800">
        <button 
          onClick={handleBold} 
          className="p-2 hover:bg-gray-200 rounded dark:hover:bg-gray-700"
          title="Pogrubienie"
        >
          <FaBold />
        </button>
        <button 
          onClick={handleItalic} 
          className="p-2 hover:bg-gray-200 rounded dark:hover:bg-gray-700"
          title="Kursywa"
        >
          <FaItalic />
        </button>
        <button 
          onClick={handleUnderline} 
          className="p-2 hover:bg-gray-200 rounded dark:hover:bg-gray-700"
          title="Podkreślenie"
        >
          <FaUnderline />
        </button>
        <div className="border-r border-gray-300 h-6 mx-1 dark:border-gray-600"></div>
        <button 
          onClick={handleHeading} 
          className="p-2 hover:bg-gray-200 rounded dark:hover:bg-gray-700"
          title="Nagłówek"
        >
          <FaHeading />
        </button>
        <button 
          onClick={handleUnorderedList} 
          className="p-2 hover:bg-gray-200 rounded dark:hover:bg-gray-700"
          title="Lista punktowana"
        >
          <FaListUl />
        </button>
        <button 
          onClick={handleOrderedList} 
          className="p-2 hover:bg-gray-200 rounded dark:hover:bg-gray-700"
          title="Lista numerowana"
        >
          <FaListOl />
        </button>
        <div className="border-r border-gray-300 h-6 mx-1 dark:border-gray-600"></div>
        <button 
          onClick={() => setShowImageModal(true)} 
          className="p-2 hover:bg-gray-200 rounded dark:hover:bg-gray-700"
          title="Wstaw obraz"
        >
          <FaImage />
        </button>
        <button 
          onClick={() => setShowLinkModal(true)} 
          className="p-2 hover:bg-gray-200 rounded dark:hover:bg-gray-700"
          title="Wstaw link"
        >
          <FaLink />
        </button>
        <button 
          onClick={handleCode} 
          className="p-2 hover:bg-gray-200 rounded dark:hover:bg-gray-700"
          title="Kod"
        >
          <FaCode />
        </button>
      </div>
      
      {/* Obszar edycji tekstu */}
      <textarea
        id="text-editor"
        value={content}
        onChange={handleChange}
        onSelect={handleSelect}
        className="flex-1 p-3 border-0 resize-none focus:ring-0 focus:outline-none dark:bg-gray-900 dark:text-white"
        placeholder="Wpisz opis sceny tutaj..."
      ></textarea>
      
      {/* Modal dodawania obrazu */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full dark:bg-gray-800 dark:text-white">
            <h3 className="text-lg font-medium mb-4">Wstaw obraz</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">URL obrazu:</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Alternatywny tekst:</label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Opis obrazu"
                />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setShowImageModal(false)}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleImageInsert}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={!imageUrl}
                >
                  Wstaw
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal dodawania linku */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full dark:bg-gray-800 dark:text-white">
            <h3 className="text-lg font-medium mb-4">Wstaw link</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">URL:</label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tekst linku (opcjonalnie):</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Kliknij tutaj"
                />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleLinkInsert}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={!linkUrl}
                >
                  Wstaw
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Podgląd formatowania - opcjonalnie możemy dodać zakładkę z podglądem */}
    </div>
  );
};

TextEditor.propTypes = {
  initialContent: PropTypes.string,
  onUpdate: PropTypes.func.isRequired
};

export default TextEditor;
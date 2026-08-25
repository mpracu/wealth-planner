import { useState, useEffect, useMemo } from 'react';
import { post as apiPost, get as apiGet, put as apiPut, del as apiDel } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useLanguage } from '../LanguageContext';
import './Budget.css';

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function Budget() {
  const { t, lang } = useLanguage();
  const currency = '€';

  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [monthOffset, setMonthOffset] = useState(0);

  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({ name: '', budgetedAmount: '' });

  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [expenseFormData, setExpenseFormData] = useState({ categoryId: '', amount: '', date: todayISO(), note: '' });

  useEffect(() => {
    loadCategories();
    loadExpenses();
  }, []);

  const loadCategories = async () => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      const response = await apiGet({
        apiName: 'WealthPlannerAPI',
        path: '/budget-categories',
        options: { headers: { Authorization: `Bearer ${token}` } }
      }).response;
      const data = await response.body.json();
      setCategories(data);
    } catch (err) {
      console.error('Error loading budget categories:', err);
    }
  };

  const loadExpenses = async () => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      const response = await apiGet({
        apiName: 'WealthPlannerAPI',
        path: '/budget-expenses',
        options: { headers: { Authorization: `Bearer ${token}` } }
      }).response;
      const data = await response.body.json();
      setExpenses(data);
    } catch (err) {
      console.error('Error loading budget expenses:', err);
    }
  };

  const viewedDate = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  const monthKey = `${viewedDate.getFullYear()}-${String(viewedDate.getMonth() + 1).padStart(2, '0')}`;
  const monthLabel = viewedDate.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { month: 'long', year: 'numeric' });

  const expensesThisMonth = useMemo(
    () => expenses.filter(e => e.date && e.date.startsWith(monthKey)),
    [expenses, monthKey]
  );

  const spentByCategory = useMemo(() => {
    const map = {};
    for (const e of expensesThisMonth) {
      map[e.categoryId] = (map[e.categoryId] || 0) + parseFloat(e.amount || 0);
    }
    return map;
  }, [expensesThisMonth]);

  const totalBudgeted = categories.reduce((sum, c) => sum + parseFloat(c.budgetedAmount || 0), 0);
  const totalSpent = expensesThisMonth.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const remaining = totalBudgeted - totalSpent;

  const categoryName = (categoryId) => categories.find(c => c.categoryId === categoryId)?.name || '';

  // ── Categories ─────────────────────────────────────────────
  const resetCategoryForm = () => {
    setCategoryFormData({ name: '', budgetedAmount: '' });
    setEditingCategoryId(null);
    setShowCategoryForm(false);
  };

  const editCategory = (cat) => {
    setCategoryFormData({ name: cat.name, budgetedAmount: cat.budgetedAmount });
    setEditingCategoryId(cat.categoryId);
    setShowCategoryForm(true);
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    if (!categoryFormData.name || !categoryFormData.budgetedAmount) return;
    const body = { name: categoryFormData.name, budgetedAmount: +categoryFormData.budgetedAmount };
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (editingCategoryId) {
        await apiPut({
          apiName: 'WealthPlannerAPI',
          path: `/budget-categories/${editingCategoryId}`,
          options: { body, headers: { Authorization: `Bearer ${token}` } }
        }).response;
      } else {
        await apiPost({
          apiName: 'WealthPlannerAPI',
          path: '/budget-categories',
          options: { body, headers: { Authorization: `Bearer ${token}` } }
        }).response;
      }
      resetCategoryForm();
      loadCategories();
    } catch (err) {
      console.error('Error saving budget category:', err);
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      await apiDel({
        apiName: 'WealthPlannerAPI',
        path: `/budget-categories/${categoryId}`,
        options: { headers: { Authorization: `Bearer ${token}` } }
      }).response;
      loadCategories();
    } catch (err) {
      console.error('Error deleting budget category:', err);
    }
  };

  // ── Expenses ───────────────────────────────────────────────
  const resetExpenseForm = () => {
    setExpenseFormData({ categoryId: categories[0]?.categoryId || '', amount: '', date: todayISO(), note: '' });
    setEditingExpenseId(null);
    setShowExpenseForm(false);
  };

  const editExpense = (exp) => {
    setExpenseFormData({ categoryId: exp.categoryId, amount: exp.amount, date: exp.date, note: exp.note || '' });
    setEditingExpenseId(exp.expenseId);
    setShowExpenseForm(true);
  };

  const saveExpense = async (e) => {
    e.preventDefault();
    if (!expenseFormData.categoryId || !expenseFormData.amount || !expenseFormData.date) return;
    const body = {
      categoryId: expenseFormData.categoryId,
      amount: +expenseFormData.amount,
      date: expenseFormData.date,
      note: expenseFormData.note
    };
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (editingExpenseId) {
        await apiPut({
          apiName: 'WealthPlannerAPI',
          path: `/budget-expenses/${editingExpenseId}`,
          options: { body, headers: { Authorization: `Bearer ${token}` } }
        }).response;
      } else {
        await apiPost({
          apiName: 'WealthPlannerAPI',
          path: '/budget-expenses',
          options: { body, headers: { Authorization: `Bearer ${token}` } }
        }).response;
      }
      resetExpenseForm();
      loadExpenses();
    } catch (err) {
      console.error('Error saving budget expense:', err);
    }
  };

  const deleteExpense = async (expenseId) => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      await apiDel({
        apiName: 'WealthPlannerAPI',
        path: `/budget-expenses/${expenseId}`,
        options: { headers: { Authorization: `Bearer ${token}` } }
      }).response;
      loadExpenses();
    } catch (err) {
      console.error('Error deleting budget expense:', err);
    }
  };

  return (
    <div className="budget">
      <div className="bud-hero">
        <div>
          <div className="bud-hero-label">{t('bud.title')}</div>
          <p className="bud-hero-sub">{t('bud.subtitle')}</p>
        </div>
        <div className="bud-month-nav">
          <button className="bud-month-btn" onClick={() => setMonthOffset(o => o - 1)} aria-label={t('bud.prevMonth')}>‹</button>
          <span className="bud-month-label">{monthLabel}</span>
          <button className="bud-month-btn" onClick={() => setMonthOffset(o => o + 1)} aria-label={t('bud.nextMonth')}>›</button>
        </div>
      </div>

      <div className="bud-summary">
        <div className="bud-stat">
          <span>{t('bud.totalBudgeted')}</span>
          <strong>{currency}{totalBudgeted.toLocaleString('es-ES', { maximumFractionDigits: 0 })}</strong>
        </div>
        <div className="bud-stat">
          <span>{t('bud.totalSpent')}</span>
          <strong>{currency}{totalSpent.toLocaleString('es-ES', { maximumFractionDigits: 0 })}</strong>
        </div>
        <div className={`bud-stat ${remaining < 0 ? 'bud-stat--negative' : 'bud-stat--positive'}`}>
          <span>{remaining < 0 ? t('bud.overBy').replace('{amount}', `${currency}${Math.abs(remaining).toLocaleString('es-ES', { maximumFractionDigits: 0 })}`) : t('bud.remaining')}</span>
          {remaining >= 0 && <strong>{currency}{remaining.toLocaleString('es-ES', { maximumFractionDigits: 0 })}</strong>}
        </div>
      </div>

      <div className="bud-section-header">
        <h3>{t('bud.categoriesSection')}</h3>
        <button className="bud-btn bud-btn--primary" onClick={() => { resetCategoryForm(); setShowCategoryForm(s => !s); }}>
          {t('bud.addCategory')}
        </button>
      </div>

      {showCategoryForm && (
        <div className="bud-form">
          <h4>{editingCategoryId ? t('bud.editCategory') : t('bud.newCategory')}</h4>
          <form onSubmit={saveCategory}>
            <div className="bud-form-grid">
              <label className="bud-field">
                <span>{t('bud.categoryName')}</span>
                <input placeholder={t('bud.categoryNamePh')} value={categoryFormData.name} onChange={e => setCategoryFormData({ ...categoryFormData, name: e.target.value })} required />
              </label>
              <label className="bud-field">
                <span>{t('bud.monthlyBudget')} ({currency})</span>
                <input type="number" step="0.01" placeholder="0.00" value={categoryFormData.budgetedAmount || ''} onChange={e => setCategoryFormData({ ...categoryFormData, budgetedAmount: e.target.value })} required />
              </label>
            </div>
            <div className="bud-form-actions">
              <button type="submit">{t('bud.saveBtn')}</button>
              <button type="button" onClick={resetCategoryForm}>{t('bud.cancel')}</button>
            </div>
          </form>
        </div>
      )}

      <div className="bud-categories">
        {categories.length === 0 && <div className="bud-empty">{t('bud.noCategories')}</div>}
        {categories.map(cat => {
          const spent = spentByCategory[cat.categoryId] || 0;
          const budgeted = parseFloat(cat.budgetedAmount || 0);
          const pct = budgeted > 0 ? Math.min(100, (spent / budgeted) * 100) : 0;
          const over = spent > budgeted;
          return (
            <div key={cat.categoryId} className="bud-cat-row">
              <div className="bud-cat-info">
                <div className="bud-cat-name">{cat.name}</div>
                <div className="bud-cat-amounts">
                  <span className={over ? 'bud-cat-spent--over' : 'bud-cat-spent'}>{currency}{spent.toLocaleString('es-ES', { maximumFractionDigits: 2 })}</span>
                  <span className="bud-cat-sep"> / </span>
                  <span className="bud-cat-budgeted">{currency}{budgeted.toLocaleString('es-ES', { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="bud-progress-track">
                  <div className={`bud-progress-fill ${over ? 'bud-progress-fill--over' : ''}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
              <div className="bud-cat-actions">
                <button className="bud-btn-icon" onClick={() => editCategory(cat)} title="Edit">✏️</button>
                <button className="bud-btn-icon bud-btn-icon--danger" onClick={() => deleteCategory(cat.categoryId)} title="Delete">🗑️</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bud-section-header">
        <h3>{t('bud.expensesSection')}</h3>
        <button
          className="bud-btn bud-btn--primary"
          disabled={categories.length === 0}
          title={categories.length === 0 ? t('bud.needCategoryFirst') : undefined}
          onClick={() => { resetExpenseForm(); setShowExpenseForm(s => !s); }}
        >
          {t('bud.addExpense')}
        </button>
      </div>

      {showExpenseForm && (
        <div className="bud-form">
          <h4>{editingExpenseId ? t('bud.editExpense') : t('bud.newExpense')}</h4>
          <form onSubmit={saveExpense}>
            <div className="bud-form-grid">
              <label className="bud-field">
                <span>{t('bud.category')}</span>
                <select value={expenseFormData.categoryId} onChange={e => setExpenseFormData({ ...expenseFormData, categoryId: e.target.value })} required>
                  <option value="">{t('bud.selectCategory')}</option>
                  {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
                </select>
              </label>
              <label className="bud-field">
                <span>{t('bud.amount')} ({currency})</span>
                <input type="number" step="0.01" placeholder="0.00" value={expenseFormData.amount || ''} onChange={e => setExpenseFormData({ ...expenseFormData, amount: e.target.value })} required />
              </label>
              <label className="bud-field">
                <span>{t('bud.date')}</span>
                <input type="date" value={expenseFormData.date} onChange={e => setExpenseFormData({ ...expenseFormData, date: e.target.value })} required />
              </label>
              <label className="bud-field bud-field--wide">
                <span>{t('bud.note')} <span className="bud-field-hint">{t('bud.notePh')}</span></span>
                <input value={expenseFormData.note} onChange={e => setExpenseFormData({ ...expenseFormData, note: e.target.value })} />
              </label>
            </div>
            <div className="bud-form-actions">
              <button type="submit">{t('bud.saveBtn')}</button>
              <button type="button" onClick={resetExpenseForm}>{t('bud.cancel')}</button>
            </div>
          </form>
        </div>
      )}

      <div className="bud-expenses">
        {expensesThisMonth.length === 0 && <div className="bud-empty">{t('bud.noExpenses')}</div>}
        {expensesThisMonth
          .slice()
          .sort((a, b) => b.date.localeCompare(a.date))
          .map(exp => (
            <div key={exp.expenseId} className="bud-exp-row">
              <div className="bud-exp-info">
                <div className="bud-exp-cat">{categoryName(exp.categoryId)}</div>
                <div className="bud-exp-sub">
                  <span>{exp.date}</span>
                  {exp.note && <span className="bud-exp-note">· {exp.note}</span>}
                </div>
              </div>
              <div className="bud-exp-right">
                <span className="bud-exp-amount">{currency}{parseFloat(exp.amount).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <div className="bud-cat-actions">
                  <button className="bud-btn-icon" onClick={() => editExpense(exp)} title="Edit">✏️</button>
                  <button className="bud-btn-icon bud-btn-icon--danger" onClick={() => deleteExpense(exp.expenseId)} title="Delete">🗑️</button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

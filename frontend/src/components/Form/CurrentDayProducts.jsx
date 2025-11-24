import styles from "./CurrentDayProducts.module.css";
import { useState, useEffect } from "react";
import { fetchWithAuth } from '../../utils/api';

export default function CurrentDayProducts({ refreshTrigger, onDataChange }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadingProductsOnlyCurrentDay = async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth("api/get-only-product-for-day", {
        method: "GET",
      });
      if (!response.ok) throw new Error("Ошибка загрузки данных");
      const productData = await response.json();
      setProducts(productData);
    } catch (error) {
      console.error("Ошибка:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const deleteProductsOnlyCurrentDay = async (productId) => {
      setIsLoading(true);
      try {
          const response = await fetchWithAuth(`api/delete-product-current-day/${productId}`, {
              method: 'DELETE',
          });
          if (!response.ok) throw new Error('Ошибка удаления изделия');

          await loadingProductsOnlyCurrentDay();

        if (onDataChange) {
            onDataChange();
        }
      } catch (error) {
          console.error('Ошибка:', error);
      } finally {
          setIsLoading(false);
      }
  }

  useEffect(() => {
    loadingProductsOnlyCurrentDay();
  }, [refreshTrigger]);

  return (
    <div className={styles.currentDayProductBlock}>
      <div className={styles.currentDayProdHeader}>
        <h2>Изделия за сегодня:</h2>
      </div>
      <ul>
        {isLoading ? (
          <li>Загрузка...</li>
        ) : products.length === 0 ? (
          <li>Еще ничего не вносили</li>
        ) : (
          products.map(product => (
              <li key={product.id}>
                  <span>{product.name}</span>
                  <button
                      className={styles.btnCurrentProductDel}
                      onClick={() => deleteProductsOnlyCurrentDay(product.id)}
                      disabled={isLoading}
                  />
              </li>
          ))
        )}
      </ul>
    </div>
  );
}

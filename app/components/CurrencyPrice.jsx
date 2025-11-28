"use client";

import { useEffect, useState } from "react";

export default function CurrencyPrice({ inr, usd, size = "text-lg", bold = true }) {
  const [currency, setCurrency] = useState("INR");
  const [symbol, setSymbol] = useState("₹");

  useEffect(() => {
    // Ensure it runs only on client
    if (typeof window === "undefined") return;

    const savedCurrency = localStorage.getItem("currency");
    if (savedCurrency) {
      setCurrency(savedCurrency);
      setSymbol(savedCurrency === "INR" ? "₹" : "$");
      return;
    }

    // 🌍 Detect country by IP (async inside useEffect)
    const detectCurrency = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data?.country_code === "IN") {
          setCurrency("INR");
          setSymbol("₹");
          localStorage.setItem("currency", "INR");
        } else {
          setCurrency("USD");
          setSymbol("$");
          localStorage.setItem("currency", "USD");
        }
      } catch (error) {
        console.warn("Currency detection failed:", error);
        setCurrency("INR");
        setSymbol("₹");
      }
    };

    detectCurrency();
  }, []);

  const displayPrice = currency === "INR" ? inr : usd;

  return (
    <span className={`${size} ${bold ? "font-semibold" : ""}`}>
      {symbol}{displayPrice}
    </span>
  );
}


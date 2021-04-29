import { useCallback, useEffect, useReducer, useState } from "react";

import { getSummarizersRequest } from "../api";
import { displayMessage } from "../utils/message";

const saveSetting = (summarizer, status) =>
  window.localStorage.setItem(summarizer, status ? "true" : "false");
const loadSetting = (summarizer) => window.localStorage.getItem(summarizer) === "true";

const useSummarizers = () => {
  const [summarizers, setSummarizers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reloading, reload] = useReducer((v) => !v, true);
  const [summarizerTypes, setSummarizerTypes] = useState(null);
  const [settings, setSettings] = useState(null);

  const toggleSetting = useCallback(
    (summarizer) => {
      const newSettings = { ...settings };
      const newValue = !settings[summarizer];
      newSettings[summarizer] = newValue;
      saveSetting(summarizer, newValue);
      setSettings(newSettings);
    },
    [settings]
  );

  useEffect(() => {
    setLoading(true);
    getSummarizersRequest()
      .then((data) => setSummarizers(data))
      .catch(() => {
        setSummarizers(null);
        setLoading(false);
        displayMessage("error fetching summarizers");
      });
  }, [setLoading, setSummarizers, reloading]);
  useEffect(() => {
    if (!summarizers) return;
    const types = {};
    Object.entries(summarizers).forEach(([summarizer, { type }]) => {
      if (types[type]) types[type].push(summarizer);
      else types[type] = [summarizer];
    });
    const newSettings = {};
    Object.keys(summarizers).forEach((summarizer) => {
      newSettings[summarizer] = loadSetting(summarizer);
    });
    setSummarizerTypes(types);
    setSettings(newSettings);
    setLoading(false);
  }, [summarizers]);

  return { reload, summarizers, summarizerTypes, loading, toggleSetting, settings };
};

export { useSummarizers };
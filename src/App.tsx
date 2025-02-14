import { ToastContainer, Flip, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Game, GameMode } from "./components/Game";
import React, { useEffect, useMemo, useState } from "react";
import { Infos } from "./components/panels/Infos";
import { useTranslation } from "react-i18next";
import { InfosFr } from "./components/panels/InfosFr";
import { Settings } from "./components/panels/Settings";
import { useSettings } from "./hooks/useSettings";
import { Worldle } from "./components/Worldle";
import { Stats } from "./components/panels/Stats";
import { useReactPWAInstall } from "@teuteuf/react-pwa-install";
import { InstallButton } from "./components/InstallButton";
import { Twemoji } from "@teuteuf/react-emoji-render";
import { getDayString, useCurrent } from "./hooks/useTodays";
import {
  LocalStoragePersistenceService,
  ServiceWorkerUpdaterProps,
  withServiceWorkerUpdater,
} from "@3m1/service-worker-updater";

const supportLink: Record<string, string> = {
  UA: "https://donate.redcrossredcrescent.org/ua/donate/~my-donation?_cv=1",
};

function App({
  newServiceWorkerDetected,
  onLoadNewServiceWorkerAccept,
}: ServiceWorkerUpdaterProps) {
  const { t, i18n } = useTranslation();
  const [mode, setMode] = useState<GameMode>("daily");

  const dayString = useMemo(getDayString, []);
  const {
    country,
    guesses,
    generateNewCountry,
    addGuess,
    clearGuesses,
    randomAngle,
    imageScale,
  } = useCurrent(mode, dayString);

  const { pwaInstall, supported, isInstalled } = useReactPWAInstall();

  const [infoOpen, setInfoOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  const [settingsData, updateSettings] = useSettings();

  useEffect(() => {
    if (newServiceWorkerDetected) {
      toast.info(
        <div dangerouslySetInnerHTML={{ __html: t("newVersion") }} />,
        {
          autoClose: false,
          onClose: () => onLoadNewServiceWorkerAccept(),
        }
      );
    }
  }, [newServiceWorkerDetected, onLoadNewServiceWorkerAccept, t]);

  useEffect(() => {
    if (settingsData.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settingsData.theme]);

  return (
    <>
      <ToastContainer
        hideProgressBar
        position="top-center"
        transition={Flip}
        theme={settingsData.theme}
        autoClose={2000}
        bodyClassName="font-bold text-center"
      />
      {i18n.resolvedLanguage === "fr" ? (
        <InfosFr
          isOpen={infoOpen}
          close={() => setInfoOpen(false)}
          settingsData={settingsData}
        />
      ) : (
        <Infos
          isOpen={infoOpen}
          close={() => setInfoOpen(false)}
          settingsData={settingsData}
        />
      )}
      <Settings
        isOpen={settingsOpen}
        close={() => setSettingsOpen(false)}
        settingsData={settingsData}
        updateSettings={updateSettings}
      />
      <Stats
        isOpen={statsOpen}
        close={() => setStatsOpen(false)}
        distanceUnit={settingsData.distanceUnit}
      />
      <div className="flex justify-center flex-auto dark:bg-slate-900 dark:text-slate-50">
        <div className="w-full max-w-lg flex flex-col">
          <header className="border-b-2 px-3 border-gray-200 flex">
            <button
              className="mr-3 text-xl"
              type="button"
              onClick={() => setInfoOpen(true)}
            >
              <Twemoji text="❓" />
            </button>
            {mode === "free" && (
              <button
                className="mr-3 text-xl"
                type="button"
                onClick={() => {
                  generateNewCountry();
                  clearGuesses();
                }}
              >
                <Twemoji text="🆕" options={{ className: "inline-block" }} />
              </button>
            )}
            {supported() && !isInstalled() && (
              <InstallButton pwaInstall={pwaInstall} />
            )}
            <h1 className="text-4xl font-bold uppercase tracking-wide text-center my-1 flex-auto">
              Wor<span className="text-green-600">l</span>dle
            </h1>
            <button
              className="ml-3 text-xl"
              type="button"
              onClick={() => setStatsOpen(true)}
            >
              <Twemoji text="📈" />
            </button>
            <button
              className="ml-3 text-xl"
              type="button"
              onClick={() => setSettingsOpen(true)}
            >
              <Twemoji text="⚙️" />
            </button>
          </header>
          <Game
            settingsData={settingsData}
            updateSettings={updateSettings}
            mode={mode}
            setMode={setMode}
            country={country}
            guesses={guesses}
            addGuess={addGuess}
            randomAngle={randomAngle}
            imageScale={imageScale}
          />
          <footer className="flex justify-center items-center text-sm mt-8 mb-1">
            <Twemoji
              text="❤️"
              className="flex items-center justify-center mr-1"
            />{" "}
            <Worldle />? -
            {country && supportLink[country.code] != null ? (
              <a
                className="underline pl-1"
                href={supportLink[country.code]}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="w-max">{t(`support.${country.code}`)}</div>
              </a>
            ) : (
              <a
                className="underline pl-1"
                href="https://www.ko-fi.com/teuteuf"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="w-max">
                  <Twemoji
                    text={t("buyMeACoffee")}
                    options={{ className: "inline-block" }}
                  />
                </div>
              </a>
            )}
          </footer>
        </div>
      </div>
    </>
  );
}

export default withServiceWorkerUpdater(App, {
  persistenceService: new LocalStoragePersistenceService("worldle"),
});

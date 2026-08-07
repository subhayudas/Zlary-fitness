"use client";

import Script from "next/script";
import { useEffect } from "react";
import { analyticsEnabled, analyticsIds, captureAttribution } from "@/lib/analytics";
import { useConsent } from "@/lib/use-consent";

/**
 * Loads measurement tags - and only after the visitor has explicitly consented.
 *
 * Nothing is injected on first paint. No provider is loaded when its id is
 * absent. `strategy="afterInteractive"` keeps every tag off the critical path,
 * so an enabled pixel cannot cost the site its Lighthouse score.
 *
 * Attribution capture runs regardless of consent: UTM parameters are read from
 * the URL the visitor themselves opened and are stored only in this browser's
 * sessionStorage, then submitted with the form the visitor chooses to send.
 * Nothing is transmitted to a third party.
 */
export function AnalyticsHelper() {
  const { consent } = useConsent();
  const granted = consent === "granted";

  useEffect(() => {
    captureAttribution();
  }, []);

  if (!analyticsEnabled || !granted) return null;

  return (
    <>
      {analyticsIds.gtm ? (
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${analyticsIds.gtm}');`}
        </Script>
      ) : null}

      {analyticsIds.ga ? (
        <>
          <Script
            id="ga-src"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${analyticsIds.ga}`}
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('consent','default',{ad_storage:'granted',analytics_storage:'granted'});gtag('config','${analyticsIds.ga}',{anonymize_ip:true});`}
          </Script>
        </>
      ) : null}

      {analyticsIds.metaPixel ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${analyticsIds.metaPixel}');fbq('track','PageView');`}
        </Script>
      ) : null}
    </>
  );
}

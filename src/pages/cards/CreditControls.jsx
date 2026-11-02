import React from "react";
import { Banknote, Globe, Nfc, Plane, Store } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { fmt } from "../../lib/format";
import { LimitSlider, Note, SectionCard, ToggleRow } from "./shared";

export default function CreditControls() {
  const { cards, updateCard, toast } = useApp();
  const card = cards.credit;
  const blockable = card.status !== "active";

  const setCh = (patch, toastMsg) => {
    updateCard("credit", { channels: { ...card.channels, ...patch } });
    if (toastMsg) toast.info(...toastMsg);
  };

  const anyIntl = card.channels.intlPos || card.channels.intlOnline || card.channels.intlAtm;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      {/* domestic */}
      <SectionCard className="lg:col-span-6" title="Domestic (India)" desc="INR transactions within India.">
        <ToggleRow icon={Store} title="In-store (POS)" desc="Chip & PIN terminals" checked={card.channels.pos && !blockable} onChange={(v) => setCh({ pos: v })} disabled={blockable} />
        <ToggleRow icon={Globe} title="Online payments" desc="E-commerce, subscriptions & in-app" checked={card.channels.online && !blockable} onChange={(v) => { setCh({ online: v }); toast.info(`Online payments ${v ? "enabled" : "disabled"}`, v ? "Tokenised merchants keep working securely." : "Recurring payments will start failing."); }} disabled={blockable} />
        <ToggleRow icon={Banknote} title="ATM cash advance" desc="2.5% fee (min ₹500), interest from day one" checked={card.channels.atm && !blockable} onChange={(v) => setCh({ atm: v })} disabled={blockable} />
        <ToggleRow icon={Nfc} title="NFC / Tap to pay" desc="Contactless at supported terminals" checked={card.channels.nfc && !blockable} onChange={(v) => setCh({ nfc: v })} disabled={blockable} />
        {card.channels.nfc && (
          <div className="px-1 pb-2 pt-1">
            <LimitSlider
              label="NFC per-tap cap"
              min={500}
              max={10000}
              step={500}
              value={card.channels.nfcLimit}
              format={(v) => fmt(v, { maximumFractionDigits: 0 })}
              hint="RBI guidance: PIN-less taps are capped at ₹5,000."
              onChange={(v) => setCh({ nfcLimit: v })}
              disabled={blockable}
            />
          </div>
        )}
        <div className="mt-2 border-t border-line pt-4">
          <LimitSlider
            label="Domestic limit per transaction"
            min={10000}
            max={card.limit}
            step={5000}
            value={card.perTxnLimit}
            format={(v) => fmt(v, { maximumFractionDigits: 0 })}
            hint="Large purchases above this need OTP confirmation."
            onChange={(v) => updateCard("credit", { perTxnLimit: v })}
            disabled={blockable}
          />
        </div>
      </SectionCard>

      {/* international */}
      <SectionCard className="lg:col-span-6" title="International" desc="Foreign currency & cross-border.">
        <ToggleRow icon={Plane} title="International POS" desc="Terminals abroad" checked={card.channels.intlPos && !blockable} onChange={(v) => { setCh({ intlPos: v }); toast.info(`International POS ${v ? "enabled" : "disabled"}`, v ? "3.5% forex markup applies." : undefined); }} disabled={blockable} />
        <ToggleRow icon={Globe} title="International online" desc="Foreign websites & app stores" checked={card.channels.intlOnline && !blockable} onChange={(v) => { setCh({ intlOnline: v }); toast.info(`International online ${v ? "enabled" : "disabled"}`, v ? "You'll see rupee estimate at checkout (demo)." : undefined); }} disabled={blockable} />
        <ToggleRow icon={Banknote} title="International ATM" desc="Cash abroad · ₹250 + 3.5% markup" checked={card.channels.intlAtm && !blockable} onChange={(v) => setCh({ intlAtm: v })} disabled={blockable} />
        {anyIntl && (
          <div className="pt-1">
            <LimitSlider
              label="International limit per transaction"
              min={5000}
              max={150000}
              step={5000}
              value={card.channels.intlLimit}
              format={(v) => fmt(v, { maximumFractionDigits: 0 })}
              onChange={(v) => setCh({ intlLimit: v })}
              disabled={blockable}
            />
          </div>
        )}
        {!anyIntl && (
          <Note icon={Plane}>
            All international channels are off — the safest default. Flip them on only
            while travelling or for foreign subscriptions.
          </Note>
        )}
      </SectionCard>
    </div>
  );
}

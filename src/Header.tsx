import React from 'react';

function Header() {
  const nudge = (d: any) => {
    vd.setDate(vd.getDate() + d);
    updDate();
  };

  const goToday = () => {
    vd = new Date();
    updDate();
  };

  const handleClick = () => {
    sw(' f ', this);
  };

  return (
    <header className="hdr">
      <div className="hdr-top">
        <div className="brand">
          <div className="lbox"><span>YIC</span></div>
          <div>
            <div className="brand-name">Sample Request</div>
            <div className="brand-sub">YIC ONE · YIC HANAM</div>
          </div>
        </div>
        <div className="dnav">
          <button className="dbt" onClick={() => nudge(-1)}>‹</button>
          <span className="dlbl" id="dlbl">Today · Fri, May 8, 2026</span>
          <button className="dbt" onClick={() => nudge(1)}>›</button>
          <button className="dtdy" onClick={goToday}>Today</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="chip" id="hstat">0 requests</span>
        </div>
      </div>
      <div className="hdr-bot">
        <button className="tab on" onClick={handleClick}>Request</button>
        <button className="tab" onClick={() => sw('s', this)}>Schedule</button>
        <button className="tab" onClick={() => sw('r', this)}>Report</button>
      </div>
    </header>
  );
}

export default Header;
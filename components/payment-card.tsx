import React from "react";
import styled from "styled-components";

const PaymentCard = () => {
  return (
    <StyledWrapper>
      <div className="card" aria-label="Tarjeta de pago demo">
        <div className="card__info">
          <div className="card__logo">LAGUNA ATHLETIC</div>
          <div className="card__chip" aria-label="Chip de tarjeta">
            <svg
              className="card__chip-lines"
              role="img"
              width="20"
              height="20"
              viewBox="0 0 100 100"
              aria-label="Chip"
            >
              <g opacity="0.8">
                <polyline
                  points="0,50 35,50"
                  fill="none"
                  stroke="#000"
                  strokeWidth={2}
                />
                <polyline
                  points="0,20 20,20 35,35"
                  fill="none"
                  stroke="#000"
                  strokeWidth={2}
                />
                <polyline
                  points="50,0 50,35"
                  fill="none"
                  stroke="#000"
                  strokeWidth={2}
                />
                <polyline
                  points="65,35 80,20 100,20"
                  fill="none"
                  stroke="#000"
                  strokeWidth={2}
                />
                <polyline
                  points="100,50 65,50"
                  fill="none"
                  stroke="#000"
                  strokeWidth={2}
                />
                <polyline
                  points="35,35 65,35 65,65 35,65 35,35"
                  fill="none"
                  stroke="#000"
                  strokeWidth={2}
                />
                <polyline
                  points="0,80 20,80 35,65"
                  fill="none"
                  stroke="#000"
                  strokeWidth={2}
                />
                <polyline
                  points="50,100 50,65"
                  fill="none"
                  stroke="#000"
                  strokeWidth={2}
                />
                <polyline
                  points="65,65 80,80 100,80"
                  fill="none"
                  stroke="#000"
                  strokeWidth={2}
                />
              </g>
            </svg>
            <div className="card__chip-texture" />
          </div>
          <div className="card__type">DEMO</div>
          <div className="card__number">
            <span>0123</span>
            <span>4567</span>
            <span>8901</span>
            <span>2345</span>
          </div>
          <div className="card__valid-thru">
            Válida
            <br />
            hasta
          </div>
          <div className="card__exp-date">
            <time dateTime="2038-01">01/38</time>
          </div>
          <div className="card__name">FAMILIA SUÁREZ</div>
          <div className="card__vendor" role="img" aria-label="Laguna Athletic">
            <span className="card__vendor-sr">Laguna Athletic</span>
          </div>
          <div className="card__texture" />
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .card,
  .card__chip {
    overflow: hidden;
    position: relative;
  }

  .card,
  .card__chip-texture,
  .card__texture {
    animation-duration: 3s;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
  }

  .card {
    animation-name: rotateCard;
    background-color: #0d75b5;
    background-image:
      radial-gradient(
        circle at 100% 0%,
        rgba(255, 255, 255, 0.1) 29.5%,
        transparent 30%
      ),
      radial-gradient(
        circle at 100% 0%,
        rgba(255, 255, 255, 0.08) 39.5%,
        transparent 40%
      ),
      radial-gradient(
        circle at 100% 0%,
        rgba(255, 255, 255, 0.08) 49.5%,
        transparent 50%
      ),
      linear-gradient(135deg, #0d75b5, #123c63 68%, #061b31);
    border-radius: 0.5em;
    box-shadow: -0.2rem 0 0.75rem rgba(0, 0, 0, 0.3);
    color: #fff;
    width: 20.6rem;
    height: 13.6rem;
    transform: translate3d(0, 0, 0);
  }

  .card__info,
  .card__chip-texture,
  .card__texture {
    position: absolute;
  }

  .card__chip-texture,
  .card__texture {
    animation-name: texture;
    top: 0;
    left: 0;
    width: 200%;
    height: 100%;
  }

  .card__info {
    font:
      0.75rem/1 "DM Sans",
      sans-serif;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    padding: 1.5rem;
    inset: 0;
  }

  .card__logo,
  .card__number {
    width: 100%;
  }

  .card__logo {
    font-size: 1rem;
    font-weight: 800;
    letter-spacing: 0.08em;
  }

  .card__chip {
    background-image: linear-gradient(#b9d4e1, #79a9bf);
    border-radius: 0.2rem;
    box-shadow: 0 0 0 0.05rem rgba(0, 0, 0, 0.5) inset;
    width: 2.5rem;
    height: 2.5rem;
    transform: translate3d(0, 0, 0);
  }

  .card__chip-lines {
    width: 100%;
    height: auto;
  }

  .card__chip-texture {
    background-image: linear-gradient(
      -80deg,
      transparent,
      rgba(255, 255, 255, 0.6) 48% 52%,
      transparent
    );
  }

  .card__type {
    align-self: flex-end;
    margin-left: auto;
    font-size: 0.65rem;
    letter-spacing: 0.12em;
  }

  .card__number,
  .card__exp-date,
  .card__name {
    background: linear-gradient(#fff, #d7eaf4 55%, #9eb5c4 70%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    font-family: "Courier Prime", monospace;
    filter: drop-shadow(0 0.05rem rgba(0, 0, 0, 0.3));
  }

  .card__number {
    font-size: 1.45rem;
    display: flex;
    justify-content: space-between;
    letter-spacing: 0.04em;
  }

  .card__valid-thru,
  .card__name {
    text-transform: uppercase;
  }

  .card__valid-thru,
  .card__exp-date {
    margin-bottom: 0.5rem;
    width: 50%;
  }

  .card__valid-thru {
    font-size: 0.5rem;
    padding-right: 0.5rem;
    text-align: right;
  }

  .card__exp-date,
  .card__name {
    font-size: 0.85rem;
  }

  .card__exp-date {
    padding-left: 0.5rem;
  }

  .card__name {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 10rem;
  }

  .card__vendor,
  .card__vendor:before,
  .card__vendor:after {
    position: absolute;
  }

  .card__vendor {
    right: 0.75rem;
    bottom: 0.75rem;
    width: 3.3rem;
    height: 2rem;
  }

  .card__vendor:before,
  .card__vendor:after {
    border-radius: 50%;
    content: "";
    display: block;
    top: 0;
    width: 2rem;
    height: 2rem;
  }

  .card__vendor:before {
    background-color: #1599e6;
    left: 0;
  }

  .card__vendor:after {
    background-color: #67c9ff;
    box-shadow: -1.4rem 0 0 #1b5c8b inset;
    right: 0;
  }

  .card__vendor-sr {
    clip: rect(1px, 1px, 1px, 1px);
    overflow: hidden;
    position: absolute;
    width: 1px;
    height: 1px;
  }

  .card__texture {
    animation-name: texture;
    background-image: linear-gradient(
      -80deg,
      rgba(255, 255, 255, 0.3) 25%,
      transparent 45%
    );
  }

  @keyframes rotateCard {
    from,
    to {
      animation-timing-function: ease-in;
      box-shadow: -0.2rem 0 0.75rem rgba(0, 0, 0, 0.3);
      transform: rotateY(-10deg);
    }

    25%,
    75% {
      animation-timing-function: ease-out;
      box-shadow: -0.25rem -0.05rem 1rem 0.15rem rgba(0, 0, 0, 0.3);
      transform: rotateY(0deg);
    }

    50% {
      animation-timing-function: ease-in;
      box-shadow: -0.3rem -0.1rem 1.5rem 0.3rem rgba(0, 0, 0, 0.3);
      transform: rotateY(10deg);
    }
  }

  @keyframes texture {
    from,
    to {
      transform: translate3d(0, 0, 0);
    }

    50% {
      transform: translate3d(-50%, 0, 0);
    }
  }

  @media (max-width: 420px) {
    .card {
      transform: scale(0.85);
      transform-origin: left center;
    }
  }
`;

export default PaymentCard;

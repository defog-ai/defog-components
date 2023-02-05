import React from "react";
import styled from "styled-components";

const SearchState = ({ type, message, svg, lottie, children }) => {
  return (
    <SearchStateWrap type={type}>
      {svg && svg}
      {lottie && lottie}
      {type === "error" && <h2>ERROR</h2>}
      {message && <h3>{message}</h3>}
      {children && <div className="searchState-child">{children}</div>}
    </SearchStateWrap>
  );
};

export default SearchState;

const SearchStateWrap = styled.div`
  margin-top: 2rem;
  background-color: #fafafc;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 5vw;
  h2 {
    margin-top: 1.2rem;
  }
  h3 {
    font-size: ${(props) => (props.type === "error" ? "2rem" : "1.6rem")};
    margin-top: 1.2rem;
  }
  svg {
    display: block;
    max-width: 70%;
    margin-inline: auto;
  }
  pre {
    white-space: pre-wrap;
    margin-top: 1.2rem;
  }
`;
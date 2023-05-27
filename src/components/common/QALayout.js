import React, { useContext } from "react";
import styled from "styled-components";
import { ThemeContext } from "../../context/ThemeContext";

const QALayout = ({ children, type }) => {
  const { theme } = useContext(ThemeContext);
  return (
    <QAWrap isAnswer={type == "Question" ? false : true} theme={theme.config}>
      <div>
        {type == "Question" ? (
          <QuestionIcon />
        ) : theme.type == "dark" ? (
          <AnswerIconDark />
        ) : (
          <AnswerIcon />
        )}{" "}
      </div>
      <div>{children}</div>
    </QAWrap>
  );
};

export default QALayout;

const QAWrap = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: flex-start;
  @media (max-width: 650px) {
    gap: 8px;
  }

  & > div:nth-of-type(1) {
    background: ${(props) => (props.theme ? props.theme.background1 : "#fff")};

    border-radius: 4px;
    min-width: 46px;
    min-height: 46px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid;
    border-color: ${(props) =>
      props.theme
        ? props.isAnswer
          ? props.theme.answerBorder
          : props.theme.questionBorder
        : "#fff"};

    @media (max-width: 650px) {
      min-width: 28px;
      min-height: 28px;
    }

    & > svg {
      width: ${(props) => (props.isAnswer ? "24px" : "28px")};
      height: 28px;
      @media (max-width: 650px) {
        width: 14px;
        height: 14px;
      }
    }
  }
  & > div:nth-of-type(2) {
    background: ${(props) => (props.theme ? props.theme.background1 : "#fff")};
    border-radius: 5px;
    max-width: calc(100% - 96px);
    width: 100%;
    padding: 12px 20px;
    border: 1px solid;
    border-color: ${(props) =>
      props.theme
        ? props.isAnswer
          ? props.theme.answerBorder
          : props.theme.questionBorder
        : "#fff"};

    @media (max-width: 650px) {
      padding: 12px;
      max-width: calc(100% - 60px);
    }
    & > p {
      color: ${(props) => (props.theme ? props.theme.primaryText : "#0D0D0D")};
    }
  }
`;

const QuestionIcon = () => {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9.79026 9.83834C10.5392 9.83834 11.1877 9.56972 11.7176 9.03974C12.2475 8.50984 12.5161 7.86148 12.5161 7.11244C12.5161 6.36366 12.2475 5.71521 11.7175 5.18515C11.1875 4.65534 10.5391 4.38672 9.79026 4.38672C9.04125 4.38672 8.39291 4.65534 7.86303 5.18523C7.33315 5.71513 7.06445 6.36358 7.06445 7.11244C7.06445 7.86148 7.33315 8.50993 7.86311 9.03982C8.39308 9.56963 9.04151 9.83834 9.79026 9.83834Z"
        fill="#888888"
      />
      <path
        d="M14.5907 12.8529C14.5757 12.6475 14.5455 12.4233 14.5011 12.1866C14.4562 11.9481 14.3984 11.7227 14.3292 11.5167C14.2578 11.3037 14.1606 11.0934 14.0404 10.8918C13.9157 10.6827 13.7693 10.5005 13.6049 10.3506C13.4331 10.1938 13.2227 10.0677 12.9793 9.97579C12.7369 9.88431 12.4682 9.83797 12.1807 9.83797C12.0679 9.83797 11.9587 9.88214 11.7478 10.013C11.6181 10.0937 11.4663 10.1871 11.2969 10.2903C11.1521 10.3783 10.9558 10.4608 10.7134 10.5354C10.477 10.6084 10.2368 10.6454 9.99986 10.6454C9.76287 10.6454 9.52285 10.6084 9.28612 10.5354C9.04399 10.4609 8.84775 10.3784 8.70306 10.2904C8.53526 10.1881 8.3834 10.0948 8.2517 10.013C8.04112 9.88206 7.93187 9.83789 7.81899 9.83789C7.53147 9.83789 7.26284 9.88431 7.02046 9.97587C6.77731 10.0677 6.56682 10.1937 6.3948 10.3507C6.23053 10.5007 6.08399 10.6827 5.95946 10.8918C5.83941 11.0934 5.74222 11.3036 5.67068 11.5167C5.60158 11.7228 5.54379 11.9481 5.49891 12.1866C5.45445 12.423 5.42424 12.6472 5.40931 12.8532C5.39463 13.055 5.38721 13.2644 5.38721 13.4759C5.38721 14.0264 5.5707 14.472 5.93255 14.8007C6.28993 15.125 6.7628 15.2895 7.33784 15.2895H12.6624C13.2374 15.2895 13.7101 15.1251 14.0676 14.8007C14.4295 14.4722 14.613 14.0265 14.613 13.4758C14.6129 13.2633 14.6054 13.0537 14.5907 12.8529Z"
        fill="#888888"
      />
    </svg>
  );
};

const AnswerIcon = () => {
  return (
    <svg viewBox="0 0 20 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_986_6037)">
        <path
          d="M9.36874 12.6852H1.47412V0.992188H9.54569C10.3803 0.992188 11.1338 1.31069 11.7221 1.91377C12.3665 2.57436 12.7218 3.47529 12.7218 4.45143V9.30263C12.7218 11.6339 10.5484 12.5318 9.39971 12.6822L9.36874 12.6867V12.6852ZM2.42224 11.7371H9.30387C9.58698 11.6928 11.7737 11.2859 11.7737 9.30115V4.45143C11.7737 3.73481 11.5083 3.05063 11.0438 2.57583C10.6324 2.15412 10.1281 1.94031 9.54569 1.94031H2.42077V11.7371H2.42224Z"
          fill="#2B59FF"
        />
        <path
          d="M8.10161 9.68427C7.83324 9.68427 7.56635 9.60759 7.30241 9.45572C6.86743 9.2021 6.60644 8.88065 6.37494 8.59754L6.35872 8.5769C6.11394 8.27609 5.88097 7.96792 5.65536 7.67006C5.49464 7.45773 5.33392 7.2454 5.16877 7.03454C5.00067 6.82073 4.82226 6.63642 4.62319 6.47127C4.55094 6.41082 4.461 6.35773 4.35336 6.3135C4.18084 6.23977 4.07762 6.24272 3.911 6.32382C3.62641 6.46242 3.45832 6.64969 3.26515 6.86792C3.03218 7.13038 2.82132 7.39875 2.63995 7.66564C2.60309 7.72757 2.49398 7.91631 2.20939 7.94138L2.09143 7.9517L1.98821 7.89272C1.82601 7.79982 1.77883 7.66564 1.76408 7.59339C1.72575 7.40022 1.83191 7.26604 1.8673 7.22181C2.1681 6.78682 2.51314 6.32382 2.98794 5.90505C3.17816 5.73696 3.46569 5.48481 3.9921 5.44352C4.6114 5.39634 4.98151 5.63521 5.23512 5.84902C5.71435 6.25451 6.04169 6.69687 6.35872 7.12596C6.4118 7.19821 6.46488 7.26899 6.51796 7.34124C6.57105 7.41202 6.62266 7.4828 6.67426 7.55357C6.95148 7.92958 7.21247 8.28494 7.59142 8.59607C7.99102 8.92341 8.21072 8.92636 8.61327 8.60491C8.9819 8.31148 9.23257 7.97087 9.49799 7.61108C9.54959 7.54178 9.6012 7.471 9.65281 7.4017C9.72359 7.30733 9.79142 7.21296 9.86072 7.11859C10.1895 6.66738 10.5287 6.19996 11.0669 5.78414C11.2895 5.61162 11.6125 5.41846 12.1285 5.4391C12.4043 5.4509 12.6151 5.50545 12.8083 5.61604C13.373 5.93602 13.696 6.35183 13.9806 6.71899L14.0543 6.81336C14.1914 6.98883 14.3212 7.1643 14.4509 7.34124C14.7296 7.72167 14.9936 8.07998 15.3238 8.42207C15.4389 8.54151 15.5863 8.67864 15.8001 8.78038C15.9741 8.86296 16.1068 8.86296 16.2734 8.78038C16.5551 8.6403 16.7379 8.45893 16.9429 8.21416C17.0756 8.05491 17.1994 7.89419 17.3248 7.73199C17.4029 7.63172 17.4811 7.52998 17.5607 7.42971C17.661 7.25719 17.8129 7.16872 18.0119 7.1643L18.1372 7.16135L18.239 7.2336C18.3422 7.30733 18.41 7.41202 18.4277 7.53146C18.4557 7.71725 18.3525 7.84848 18.3186 7.89124L18.2183 8.02837C17.9013 8.46483 17.5725 8.91456 17.049 9.31269C16.7851 9.51322 16.4725 9.69754 15.9771 9.6769C15.5008 9.65625 15.2147 9.46309 14.9818 9.2832C14.5792 8.97207 14.3108 8.62408 14.0499 8.28789L14.0041 8.22891C13.8773 8.06524 13.7564 7.90009 13.6355 7.73347C13.3819 7.384 13.1415 7.05518 12.8407 6.74111C12.6815 6.57449 12.5355 6.44325 12.3365 6.33709C12.1403 6.2324 12.0342 6.22945 11.844 6.32529C11.4488 6.52288 11.2379 6.79124 10.9932 7.09942L10.8958 7.22181C10.7351 7.42087 10.5818 7.63172 10.4328 7.83373C10.1394 8.23481 9.83565 8.65062 9.44048 9.04285C9.31219 9.17113 9.1323 9.3348 8.88163 9.47046C8.62064 9.61202 8.35965 9.68279 8.10161 9.68279V9.68427Z"
          fill="#181818"
        />
        <path
          d="M18.7732 5.82422H17.1468C16.9155 5.82422 16.728 6.01171 16.728 6.24298V7.86939C16.728 8.10067 16.9155 8.28816 17.1468 8.28816H18.7732C19.0045 8.28816 19.192 8.10067 19.192 7.86939V6.24298C19.192 6.01171 19.0045 5.82422 18.7732 5.82422Z"
          fill="#F8FAFB"
        />
        <path
          d="M18.6523 8.66666H17.2663C16.7605 8.66666 16.3491 8.25527 16.3491 7.7495V6.36345C16.3491 5.85768 16.7605 5.44629 17.2663 5.44629H18.6523C19.1581 5.44629 19.5695 5.85768 19.5695 6.36345V7.7495C19.5695 8.25527 19.1581 8.66666 18.6523 8.66666ZM17.2663 6.20272C17.1778 6.20272 17.107 6.27497 17.107 6.36197V7.74803C17.107 7.8365 17.1793 7.90728 17.2663 7.90728H18.6523C18.7408 7.90728 18.8116 7.83503 18.8116 7.74803V6.36197C18.8116 6.2735 18.7393 6.20272 18.6523 6.20272H17.2663Z"
          fill="#2B59FF"
        />
        <path
          d="M2.85425 5.82422H1.22785C0.99657 5.82422 0.809082 6.01171 0.809082 6.24298V7.86939C0.809082 8.10067 0.99657 8.28816 1.22785 8.28816H2.85425C3.08553 8.28816 3.27302 8.10067 3.27302 7.86939V6.24298C3.27302 6.01171 3.08553 5.82422 2.85425 5.82422Z"
          fill="#F8FAFB"
        />
        <path
          d="M2.73437 8.66666H1.34831C0.842546 8.66666 0.431152 8.25527 0.431152 7.7495V6.36345C0.431152 5.85768 0.842546 5.44629 1.34831 5.44629H2.73437C3.24013 5.44629 3.65152 5.85768 3.65152 6.36345V7.7495C3.65152 8.25527 3.24013 8.66666 2.73437 8.66666ZM1.34831 6.20272C1.25984 6.20272 1.18906 6.27497 1.18906 6.36197V7.74803C1.18906 7.8365 1.26131 7.90728 1.34831 7.90728H2.73437C2.82284 7.90728 2.89361 7.83503 2.89361 7.74803V6.36197C2.89361 6.2735 2.82136 6.20272 2.73437 6.20272H1.34831Z"
          fill="#2B59FF"
        />
      </g>
      <defs>
        <clipPath id="clip0_986_6037">
          <rect
            width="19.1379"
            height="11.693"
            fill="white"
            transform="translate(0.431152 0.992188)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

const AnswerIconDark = () => {
  return (
    <svg
      width="20"
      height="13"
      viewBox="0 0 20 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_977_6678)">
        <path
          d="M9.36826 12.6852H1.47363V0.992188H9.5452C10.3798 0.992188 11.1333 1.31069 11.7216 1.91377C12.366 2.57436 12.7213 3.47529 12.7213 4.45143V9.30263C12.7213 11.6339 10.5479 12.5318 9.39922 12.6822L9.36826 12.6867V12.6852ZM2.42175 11.7371H9.30338C9.58649 11.6928 11.7732 11.2859 11.7732 9.30115V4.45143C11.7732 3.73481 11.5078 3.05063 11.0433 2.57583C10.6319 2.15412 10.1276 1.94031 9.5452 1.94031H2.42028V11.7371H2.42175Z"
          fill="#2B59FF"
        />
        <path
          d="M8.10136 9.68427C7.833 9.68427 7.56611 9.60759 7.30217 9.45572C6.86718 9.2021 6.60619 8.88065 6.37469 8.59754L6.35847 8.5769C6.1137 8.27609 5.88072 7.96792 5.65512 7.67006C5.4944 7.45773 5.33367 7.2454 5.16853 7.03454C5.00043 6.82073 4.82201 6.63642 4.62295 6.47127C4.5507 6.41082 4.46075 6.35773 4.35311 6.3135C4.18059 6.23977 4.07738 6.24272 3.91075 6.32382C3.62617 6.46242 3.45807 6.64969 3.26491 6.86792C3.03193 7.13038 2.82108 7.39875 2.63971 7.66564C2.60285 7.72757 2.49373 7.91631 2.20915 7.94138L2.09119 7.9517L1.98797 7.89272C1.82577 7.79982 1.77859 7.66564 1.76384 7.59339C1.7255 7.40022 1.83167 7.26604 1.86706 7.22181C2.16786 6.78682 2.5129 6.32382 2.9877 5.90505C3.17791 5.73696 3.46545 5.48481 3.99185 5.44352C4.61115 5.39634 4.98126 5.63521 5.23488 5.84902C5.7141 6.25451 6.04145 6.69687 6.35847 7.12596C6.41155 7.19821 6.46464 7.26899 6.51772 7.34124C6.5708 7.41202 6.62241 7.4828 6.67402 7.55357C6.95123 7.92958 7.21222 8.28494 7.59118 8.59607C7.99077 8.92341 8.21048 8.92636 8.61302 8.60491C8.98166 8.31148 9.23233 7.97087 9.49774 7.61108C9.54935 7.54178 9.60096 7.471 9.65257 7.4017C9.72334 7.30733 9.79117 7.21296 9.86048 7.11859C10.1893 6.66738 10.5284 6.19996 11.0666 5.78414C11.2893 5.61162 11.6122 5.41846 12.1283 5.4391C12.404 5.4509 12.6149 5.50545 12.8081 5.61604C13.3728 5.93602 13.6957 6.35183 13.9803 6.71899L14.054 6.81336C14.1912 6.98883 14.3209 7.1643 14.4507 7.34124C14.7294 7.72167 14.9933 8.07998 15.3236 8.42207C15.4386 8.54151 15.5861 8.67864 15.7999 8.78038C15.9739 8.86296 16.1066 8.86296 16.2732 8.78038C16.5548 8.6403 16.7377 8.45893 16.9426 8.21416C17.0753 8.05491 17.1992 7.89419 17.3245 7.73199C17.4027 7.63172 17.4808 7.52998 17.5605 7.42971C17.6607 7.25719 17.8126 7.16872 18.0117 7.1643L18.137 7.16135L18.2387 7.2336C18.342 7.30733 18.4098 7.41202 18.4275 7.53146C18.4555 7.71725 18.3523 7.84848 18.3184 7.89124L18.2181 8.02837C17.9011 8.46483 17.5723 8.91456 17.0488 9.31269C16.7849 9.51322 16.4723 9.69754 15.9768 9.6769C15.5005 9.65625 15.2145 9.46309 14.9815 9.2832C14.579 8.97207 14.3106 8.62408 14.0496 8.28789L14.0039 8.22891C13.8771 8.06524 13.7562 7.90009 13.6353 7.73347C13.3816 7.384 13.1413 7.05518 12.8405 6.74111C12.6812 6.57449 12.5353 6.44325 12.3362 6.33709C12.1401 6.2324 12.0339 6.22945 11.8437 6.32529C11.4485 6.52288 11.2377 6.79124 10.9929 7.09942L10.8956 7.22181C10.7349 7.42087 10.5815 7.63172 10.4326 7.83373C10.1392 8.23481 9.83541 8.65062 9.44023 9.04285C9.31195 9.17113 9.13206 9.3348 8.88139 9.47046C8.6204 9.61202 8.35941 9.68279 8.10136 9.68279V9.68427Z"
          fill="#EFF3F9"
        />
        <path
          d="M18.773 5.82422H17.1465C16.9153 5.82422 16.7278 6.01171 16.7278 6.24298V7.86939C16.7278 8.10067 16.9153 8.28816 17.1465 8.28816H18.773C19.0042 8.28816 19.1917 8.10067 19.1917 7.86939V6.24298C19.1917 6.01171 19.0042 5.82422 18.773 5.82422Z"
          fill="#131321"
        />
        <path
          d="M18.6518 8.66666H17.2658C16.76 8.66666 16.3486 8.25527 16.3486 7.7495V6.36345C16.3486 5.85768 16.76 5.44629 17.2658 5.44629H18.6518C19.1576 5.44629 19.569 5.85768 19.569 6.36345V7.7495C19.569 8.25527 19.1576 8.66666 18.6518 8.66666ZM17.2658 6.20272C17.1773 6.20272 17.1065 6.27497 17.1065 6.36197V7.74803C17.1065 7.8365 17.1788 7.90728 17.2658 7.90728H18.6518C18.7403 7.90728 18.8111 7.83503 18.8111 7.74803V6.36197C18.8111 6.2735 18.7388 6.20272 18.6518 6.20272H17.2658Z"
          fill="#2B59FF"
        />
        <path
          d="M2.85401 5.82422H1.2276C0.996326 5.82422 0.808838 6.01171 0.808838 6.24298V7.86939C0.808838 8.10067 0.996326 8.28816 1.2276 8.28816H2.85401C3.08529 8.28816 3.27278 8.10067 3.27278 7.86939V6.24298C3.27278 6.01171 3.08529 5.82422 2.85401 5.82422Z"
          fill="#131321"
        />
        <path
          d="M2.73412 8.66666H1.34806C0.842302 8.66666 0.430908 8.25527 0.430908 7.7495V6.36345C0.430908 5.85768 0.842302 5.44629 1.34806 5.44629H2.73412C3.23988 5.44629 3.65128 5.85768 3.65128 6.36345V7.7495C3.65128 8.25527 3.23988 8.66666 2.73412 8.66666ZM1.34806 6.20272C1.25959 6.20272 1.18882 6.27497 1.18882 6.36197V7.74803C1.18882 7.8365 1.26107 7.90728 1.34806 7.90728H2.73412C2.82259 7.90728 2.89337 7.83503 2.89337 7.74803V6.36197C2.89337 6.2735 2.82112 6.20272 2.73412 6.20272H1.34806Z"
          fill="#2B59FF"
        />
      </g>
      <defs>
        <clipPath id="clip0_977_6678">
          <rect
            width="19.1379"
            height="11.693"
            fill="white"
            transform="translate(0.430908 0.992188)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

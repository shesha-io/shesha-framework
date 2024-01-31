import styled from 'styled-components';

const bigFont = 45;
const primaryFont = 26;
const secondaryFont = 18;

export const CustomErrorBoundaryContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  justify-items: center;
  align-content: center;

  .oops {
    font-size: ${bigFont};
  }

  .error-icon {
    margin-top: 15px;
    font-size: ${bigFont};
  }

  .primary-message {
    font-size: ${primaryFont};
  }

  .secondary-message {
    font-size: ${secondaryFont};
  }

  .take-me-home {
    margin-bottom: ${bigFont};
  }
`;

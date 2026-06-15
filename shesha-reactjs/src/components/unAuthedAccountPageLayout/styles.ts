import { createStyles } from 'antd-style';

export const useStyles = createStyles({
  container: {
    "display": 'flex',
    "overflowX": 'hidden',
    "background": '#ebeeef',
    "height": '100vh',
    "alignItems": 'center',

    '.un-authed-account-page-layout-form-container': {
      "width": '100%',
      "marginBottom": '45px',

      '.un-authed-account-page-layout-heading, .un-authed-account-page-layout-hint': {
        textAlign: 'center',
      },

      '.un-authed-account-page-layout-form': {
        '.un-authed-account-page-layout-logo': {
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '15px',

          img: {
            height: '120px',
          },
        },

        '.ant-alert': {
          textAlign: 'left',
          marginBottom: '10px',
        },

        '.ant-row': {
          '&.ant-form-item': {
            "marginBottom": '20px',

            '&.un-authed-btn-container': {
              marginBottom: '15px',
            },
          },
        },

        '.ant-form-item-control:not(.has-error) .ant-form-explain': {
          display: 'none !important',
        },
      },
    },
  },
});

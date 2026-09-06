const theme = {
  token: {
    colorPrimary: '#4f8cff',
    colorInfo: '#4f8cff',
    colorSuccess: '#3dd68c',
    colorWarning: '#f2b84b',
    colorError: '#f2555a',

    colorBgBase: '#0b0f14',
    colorBgContainer: '#121821',
    colorBgElevated: '#151c26',
    colorBgLayout: '#0b0f14',
    colorBorder: '#212b37',
    colorBorderSecondary: '#1a232e',

    colorText: '#c7d0db',
    colorTextHeading: '#eef2f6',
    colorTextSecondary: '#8a96a5',
    colorTextTertiary: '#7c8a9a',
    colorTextPlaceholder: '#5d6a78',

    fontFamily: "'Vazirmatn', 'Segoe UI', Tahoma, sans-serif",
    borderRadius: 10,
    borderRadiusLG: 14,
    borderRadiusSM: 8,

    controlHeight: 36,
  },
  components: {
    Modal: {
      contentBg: '#121821',
      headerBg: '#121821',
      titleColor: '#eef2f6',
    },
    Card: {
      colorBgContainer: '#121821',
    },
    Input: {
      colorBgContainer: '#0e131a',
      activeBorderColor: '#4f8cff',
      hoverBorderColor: '#3a4a5c',
    },
    InputNumber: {
      colorBgContainer: '#0e131a',
      activeBorderColor: '#4f8cff',
      hoverBorderColor: '#3a4a5c',
    },
    Button: {
      primaryShadow: 'none',
      fontWeight: 500,
    },
    Tag: {
      defaultBg: '#17202b',
      defaultColor: '#c7d0db',
    },
    Breadcrumb: {
      itemColor: '#7c8a9a',
      lastItemColor: '#eef2f6',
      separatorColor: '#3a4a5c',
      linkHoverColor: '#77a6ff',
    },
    Alert: {
      colorInfoBg: 'rgba(79, 140, 255, 0.1)',
      colorInfoBorder: 'rgba(79, 140, 255, 0.3)',
    },
  },
}

export default theme

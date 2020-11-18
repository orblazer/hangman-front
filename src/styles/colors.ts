import chroma from 'chroma-js'
import nord from './nord'

const derived = {
  primary: nord.pink,
  secondary: nord.blue,
  black: '#1c1c1c',
  gray: chroma(nord.white2).darken(2).hex(),

  // Status
  info: nord.blue,
  success: nord.green,
  warning: nord.yellow,
  danger: nord.red
}

export default {
  ...derived,
  // General
  body: {
    backgroundColor: nord.black,
    color: nord.white
  },
  selection: {
    backgroundColor: chroma(derived.secondary).alpha(0.5).hex()
  },
  header: {
    backgroundColor: nord.black1,
    color: nord.white
  },
  footer: {
    backgroundColor: nord.black,
    color: nord.white
  },
  input: {
    backgroundColor: nord.black1,
    color: nord.white,
    placeholder: derived.gray,
    disabledColor: chroma(nord.white).darken(2).hex(),
    borderColor: nord.black3,
    hoverBorderColor: chroma(nord.black3).brighten(0.5).hex(),
    errorBorderColor: nord.red,
    hoverErrorBorderColor: chroma(nord.red).darken(0.5).hex(),
    help: chroma(nord.white2).darken(1.5).hex(),
    helpError: nord.red
  },
  select: {
    selectedBackgroundColor: nord.black2,
    multiBackgroundColor: nord.black3,
    multiRemoveBackgroundColor: nord.red,
    multiBorderColor: nord.black1,
    clearColor: nord.white,
    clearHoverColor: chroma(nord.white).brighten(1.5).hex(),
    clearFocusColor: derived.gray,
    clearFocusHoverColor: nord.white
  },
  switch: {
    activeBackgroundColor: nord.black2,
    activeDotBackgroundColor: derived.primary
  },
  link: {
    color: derived.primary,
    hoverColor: derived.secondary
  },
  button: {
    primary: {
      backgroundColor: derived.primary,
      hoverBackgroundColor: chroma(derived.primary).brighten(0.4).hex(),
      color: derived.black
    },
    secondary: {
      backgroundColor: derived.secondary,
      hoverBackgroundColor: chroma(derived.secondary).brighten(0.5).hex(),
      color: derived.black
    },
    black: {
      backgroundColor: nord.black,
      hoverBackgroundColor: chroma(nord.black).brighten(0.5).hex(),
      color: nord.white
    },
    white: {
      backgroundColor: nord.white,
      hoverBackgroundColor: chroma(nord.white).brighten(1).hex(),
      color: derived.black
    }
  }
}

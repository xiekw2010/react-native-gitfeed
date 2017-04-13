import * as BView from './BlurView'

module.exports = BView.default

if (global) {
  global.__exponent = {
    Components: {
      BlurView: BView.default
    }
  }
}

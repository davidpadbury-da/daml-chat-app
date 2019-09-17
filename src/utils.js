export const onChange = fn => {
  let priorValue

  return value => {
    // equality is hard, so just serialize everything instead 🙈
    if (JSON.stringify(priorValue) !== JSON.stringify(value)) {
      priorValue = value
      fn(value)
    }
  }
}
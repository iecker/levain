deno test --allow-all --unstable --coverage=coverage
deno coverage coverage --lcov > coverage/lcov.info
lcov --summary coverage/lcov.info # brew install lcov

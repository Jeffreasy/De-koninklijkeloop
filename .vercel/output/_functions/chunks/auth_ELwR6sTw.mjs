import { atom } from 'nanostores';

const $accessToken = atom(null);
const $user = atom(null);
function setAuth(token, user) {
  $accessToken.set(token);
  $user.set(user);
}

export { $user as $, $accessToken as a, setAuth as s };

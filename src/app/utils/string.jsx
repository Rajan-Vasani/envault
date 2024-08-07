export const capitaliseString = string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const getInitials = userName => {
  const name = userName ? userName : 'ME';
  const names = name.split(' ');
  let initials = names[0].substring(0, 1).toUpperCase();
  if (names.length > 1) {
    initials += [...names].pop().substring(0, 1).toUpperCase();
  }
  return initials;
};

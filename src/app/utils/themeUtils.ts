

export const getInitialTheme  = () : string => {
    // Get theme from local storage cookie
    if(localStorage && localStorage.getItem('theme'))       
        return localStorage.getItem('theme') || 'light';
    
    // Check System preferred Theme
    const prefersDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    return prefersDarkTheme? 'dark' :'light';
}

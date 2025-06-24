    class PotionsPage extends HTMLElement {
        constructor() {
            super();
            const shadow = this.attachShadow({ mode: 'open' });
            shadow.innerHTML = `
                <html lang="en">
                  <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <meta
                      name="description"
                      content="Potions helps businesses build newsletters."
                    />
                    <meta property="og:image" content="https://withpotions.com/PotionsPreview.png" />
                    <meta
                      name="keywords"
                      content="Newsletter, Newsletters, Email, Email Marketing, Marketing, Business"
                    />
                    <meta name="author" content="Evan Kozliner" />
                    <link rel="stylesheet" href="style.css" />
                    <link rel="stylesheet" type="text/css" href="webfonts/prosa-light.css">
                    <link rel="icon" href="airplane.svg" />
                
                    <title>
                      Potions | We make building newsletters easy
                    </title>
                
                      <!-- Meta Pixel Code -->
                <script>
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '1619668331969779');
                fbq('track', 'PageView');
                </script>
                <noscript><img height="1" width="1" style="display:none"
                src="https://www.facebook.com/tr?id=1619668331969779&ev=PageView&noscript=1"
                /></noscript>
                <!-- End Meta Pixel Code -->
                
                  </head>
                  <!-- Google Tag Manager -->
                <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','GTM-W879CWPC');</script>
                <!-- End Google Tag Manager -->
                  <!-- Google tag (gtag.js) -->
                <!--  old gtag (keeping temporaryily for debugging purposes-->
                <!--  <script-->
                <!--    async-->
                <!--    src="https://www.googletagmanager.com/gtag/js?id=G-L7YXR0RQTQ"-->
                <!--  ></script>-->
                  <script async src="https://www.googletagmanager.com/gtag/js?id=G-KWPFW1EC60"></script>
                  <script>
                    window.dataLayer = window.dataLayer || [];
                    function gtag() {
                      dataLayer.push(arguments);
                    }
                    gtag("js", new Date());
                
                    gtag("config", "G-KWPFW1EC60");
                  </script>
                  <script>!function () {var reb2b = window.reb2b = window.reb2b || [];if (reb2b.invoked) return;reb2b.invoked = true;reb2b.methods = ["identify", "collect"];reb2b.factory = function (method) {return function () {var args = Array.prototype.slice.call(arguments);args.unshift(method);reb2b.push(args);return reb2b;};};for (var i = 0; i < reb2b.methods.length; i++) {var key = reb2b.methods[i];reb2b[key] = reb2b.factory(key);}reb2b.load = function (key) {var script = document.createElement("script");script.type = "text/javascript";script.async = true;script.src = "https://s3-us-west-2.amazonaws.com/b2bjsstore/b/" + key + "/reb2b.js.gz";var first = document.getElementsByTagName("script")[0];first.parentNode.insertBefore(script, first);};reb2b.SNIPPET_VERSION = "1.0.1";reb2b.load("QOQRJHY0GM62");}();</script>
                  <script src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.7.8/lottie.min.js"></script>
                  <body>
                  <!-- Google Tag Manager (noscript) -->
                <!--<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-W879CWPC"-->
                <!--height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>-->
                <!-- End Google Tag Manager (noscript) -->
                <header>
                    <nav>
                        <div class="logo">
                            <a href="index.html">
                                <img src="potions-logo.svg" alt="Logo" class="logo-img">
                            </a>
                        </div>
                        <ul class="nav-links">
                            <li><a href="./index.html#testimonial" class="hover-underline">Testimonials</a></li>
                            <li><a href="samples.html" class="hover-underline">Samples</a></li>
                            <li><a href="./index.html#faq" class="hover-underline">FAQ</a></li>
                            <li><a href="./index.html#pricing" class="hover-underline">Pricing</a></li>
                            <li><a href="https://billing.stripe.com/p/login/5kA7tpbg6cSJ8gwbII" class="hover-underline">Manage Subscription</a></li>
                        </ul>
                        <div class="burger">
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                    </nav>
                </header>
                    <main>
                
                
                
                
                
                <slot></slot>
                
                
                
                
                      <footer class="footer">
                        <ul>
                          <li><a href="terms_and_conditions.html">Terms & Conditions</a></li>
                          <li>©Potions 2025. All rights reserved.</li>
                          <li><a href="private_policy.html">Privacy Policy</a></li>
                        </ul>
                      </footer>
                    </main>
                
                    <script src="faq.js"></script>
                    <script src="utm.js"></script>
                    <script src="lottie.js"></script>
                  <script src="billing.js">
                </script>
                
                    <script src="hamburger.js"></script>
                    <script src="https://embed.typeform.com/next/embed.js"></script>
                  </body>
                </html>

          `;
        }
    }
    customElements.define('potions-page', PotionsPage);

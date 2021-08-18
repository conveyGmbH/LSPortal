// controller for page: imgMedia
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/lib/hammer/scripts/hammer.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/uploadMedia/uploadMediaService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("UploadMedia", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options, commandList) {
            Log.call(Log.l.trace, "UploadMedia.Controller.", "docId=" + (options && options.docId));

            Fragments.Controller.apply(this, [fragmentElement, {
                docId: options && options.docId,
                fileInfo: "",
                dataDoc: {},
                showLoadingCircle: false
            }, commandList]);

            var dropZone = fragmentElement.querySelector("#dropzone");
            var fileOpener = fragmentElement.querySelector("input[type=file]");

            var that = this;

            /*var base64ToBlob = function (base64Data, contentType) {
                contentType = contentType || '';
                var sliceSize = 1024;
                var base64result = base64Data.split(',')[1];
                var byteCharacters = atob(base64result);
                var bytesLength = byteCharacters.length;
                var slicesCount = Math.ceil(bytesLength / sliceSize);
                var byteArrays = new Array(slicesCount);

                for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
                    var begin = sliceIndex * sliceSize;
                    var end = Math.min(begin + sliceSize, bytesLength);

                    var bytes = new Array(end - begin);
                    for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
                        bytes[i] = byteCharacters[offset].charCodeAt(0);
                    }
                    byteArrays[sliceIndex] = new Uint8Array(bytes);
                }
                return new Blob(byteArrays, { type: contentType });
            }
            this.base64ToBlob = base64ToBlob;*/

            var insertImage = function (wFormat, mimeType, fileName, result) {
                var cameraQuality = 80;
                var ovwEdge = 256;
                var prevEdge = 1920;
                var prevLength = 0;
                var err = null;
                Log.call(Log.l.trace, "UploadMedia.Controller.");
                AppData.setErrorMsg(that.binding);

                var img = new Image();
                img.src = result;

                var imageData = result.split(',')[1];

                var dataDoc = {
                    wFormat: wFormat,
                    ColorType: 11,
                    ulDpm: 0,
                    szOriFileNameDOC1: fileName,
                    ulOvwEdge: ovwEdge,
                    ulPrevEdge: prevEdge,
                    ContentEncoding: 4096
                }
                // UTC-Zeit in Klartext
                var now = new Date();
                var dateStringUtc = now.toUTCString();

                var ret = new WinJS.Promise.as().then(function () {
                    return WinJS.Promise.timeout(50);
                }).then(function () {
                    var width = img.width;
                    var height = img.height;
                    Log.print(Log.l.trace, "width=" + width + " height=" + height);
                    if (width && height && (width < 3840 || height < 3840) || imageData.length < 1000000) {
                        dataDoc.ulWidth = width;
                        dataDoc.ulHeight = height;
                        // keep original 
                        return WinJS.Promise.as();
                    }
                    return Colors.resizeImageBase64(imageData, "image/jpeg", 3840, cameraQuality, 0.25);
                }).then(function (resizeData) {
                    if (resizeData) {
                        Log.print(Log.l.trace, "resized");
                        imageData = resizeData;
                        mimeType = "image/jpeg";
                        var posExt = fileName.lastIndexOf(".");
                        if (posExt >= 0) {
                            fileName = fileName.substr(0, posExt) + ".jpg";
                        } else {
                            fileName += ".jpg";
                        }
                        dataDoc.wFormat = 3;
                        img.src = "data:image/jpeg;base64," + imageData;
                        return WinJS.Promise.timeout(50);
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    return Colors.resizeImageBase64(imageData, "image/jpeg", prevEdge, cameraQuality);
                }).then(function (prevData) {
                    if (prevData && prevData.length < imageData.length) {
                        var contentLengthPrev = Math.floor(prevData.length * 3 / 4);
                        dataDoc.PrevContentDOCCNT2 =
                            "Content-Type: image/jpegAccept-Ranges: bytes\x0D\x0ALast-Modified: " +
                            dateStringUtc +
                            "\x0D\x0AContent-Length: " +
                            contentLengthPrev +
                            "\x0D\x0A\x0D\x0A" +
                            prevData;
                        prevLength = prevData.length;
                    } else {
                        prevLength = imageData.length;
                    }
                    return Colors.resizeImageBase64(prevData || imageData, "image/jpeg", ovwEdge, cameraQuality);
                }).then(function (ovwData) {
                    dataDoc.ulWidth = img.width;
                    dataDoc.ulHeight = img.height;

                    // decodierte Dateigröße
                    var contentLength = Math.floor(imageData.length * 3 / 4);

                    dataDoc.DocContentDOCCNT1 = "Content-Type: " + mimeType + "Accept-Ranges: bytes\x0D\x0ALast-Modified: " +
                        dateStringUtc +
                        "\x0D\x0AContent-Length: " +
                        contentLength +
                        "\x0D\x0A\x0D\x0A" +
                        imageData;

                    if (ovwData && ovwData.length < prevLength) {
                        var contentLengthOvw = Math.floor(ovwData.length * 3 / 4);
                        dataDoc.OvwContentDOCCNT3 =
                            "Content-Type: image/jpegAccept-Ranges: bytes\x0D\x0ALast-Modified: " +
                            dateStringUtc +
                            "\x0D\x0AContent-Length: " +
                            contentLengthOvw +
                            "\x0D\x0A\x0D\x0A" +
                            ovwData;
                    }
                    AppBar.busy = true;
                    return UploadMedia.docView.insert(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        AppBar.busy = false;
                        Log.print(Log.l.trace, "docView insert: success!");
                        // select returns object already parsed from json file in response
                        if (json && json.d) {
                            that.binding.dataDoc = json.d;
                            that.binding.docId = json.d.DOC1MandantDokumentVIEWID;
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppBar.busy = false;
                        AppData.setErrorMsg(that.binding, errorResponse);
                    },
                    dataDoc, that.binding.docId, 1);
                }).then(function () {
                    if (AppBar.scope && typeof AppBar.scope.loadList === "function") {
                        return AppBar.scope.loadList(that.binding.docId);
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (AppBar.scope && typeof AppBar.scope.loadDoc === "function") {
                        return AppBar.scope.loadDoc(that.binding.docId, 1, wFormat);
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function() {
                    that.binding.fileInfo = "";
                    that.binding.showLoadingCircle = false;
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.insertImage = insertImage;

            var insertOtherDocData = function (wFormat, wGroupDoc, mimeType, fileName, result) {
                var cameraQuality = 80;
                var ovwEdge = 256;
                var prevEdge = 1920;
                var prevLength = 0;
                var err = null;
                Log.call(Log.l.trace, "UploadMedia.Controller.");
                AppData.setErrorMsg(that.binding);
                var doc = {};
                doc['src'] = result;
                /*Content-Type: application/pdf;charset=UTF-8
                Last - Modified: Fri, 28 Jun 2019 14: 53: 47 GMT
                Content - Length: 49583

                JVBERi0xLjQKMSAwIG9iago8PAovVGl0bGUgKP7 / AFEAUgAtAEMAbwBkAGUAIAB6AHUAIABNAGUAcwBzAGUAOgAgAGMAbwBuAHYAZQB5ACAARgBhAHMAYwBoAGkAbgBnACAAMgAwADEAOSkKL0NyZWF0b3IgKP7 / AHcAawBoAHQAbQBsAHQAbwBwAGQAZgAgADAALgAxADIALgA0KQovUHJvZHVjZXIgKP7 / AFEAdAAgADQALgA4AC4ANykKL0NyZWF0aW9uRGF0ZSAoRDoyMDE5MDYyODE0NTM0NiswMicwMCcpCj4 + CmVuZG9iagozIDAgb2JqCjw8Ci9UeXBlIC9FeHRHU3RhdGUKL1NBIHRydWUKL1NNIDAuMDIKL2NhIDEuMAovQ0EgMS4wCi9BSVMgZmFsc2UKL1NNYXNrIC9Ob25lPj4KZW5kb2JqCjQgMCBvYmoKWy9QYXR0ZXJuIC9EZXZpY2VSR0JdCmVuZG9iago4IDAgb2JqCjw8Ci9UeXBlIC9YT2JqZWN0Ci9TdWJ0eXBlIC9JbWFnZQovV2lkdGggMTAwCi9IZWlnaHQgMTAwCi9CaXRzUGVyQ29tcG9uZW50IDgKL0NvbG9yU3BhY2UgL0RldmljZVJHQgovTGVuZ3RoIDkgMCBSCi9GaWx0ZXIgL0ZsYXRlRGVjb2RlCj4 + CnN0cmVhbQp4nO2R2ZXDMAwD03 / T2QKigCOQ8sva4KdM4hi / XjPzxrM8aYrrzaGKYxNWfB7FipflIZdpT9TReaY6hhXvGFa8Y1jxjlpcByuzleedjk1WRscpnbDiOmHFdXhHWHYrW1jxbGHFs4UVz3YnVlrw9YWqscm / Gh2ndMKK6zyWFR + DlWekHXfzeI5hxR3DijuGFXecGp1tuXn08WjZ5oQVnyeweh8YKD7I6ppeJyas + IQVn7uyWorrGDwb / FpWm4pxos5R8bB6Aisuzs8NwWbyz00PC3 / k1XYnrPg8lhV3N8oa4qWj1vE2w4pvhhXfDCujDn / UyeFXz7GpwwF2xLVOWJXJn8BK35aCesHQbDo2pxOymdzQbDqGVVjxkx9h1Sy73Px8HEw + 1ZEPzOPphBXfvCsrXXa54D3Cr + XAOjwk11neGo7lI / y6lTOseM6w4jkvZqVP + OPUNB2XdQxW5WNY8RhhxWPoPNrRCDxFoDy / ps5R8bDi4mHFxf8vK8PumyDfhLPlTsqW4suFsOJ1worX4eJaUz + WgrpOGQNOU5wnN865ICUVVmH1DFZL8WaMT50yLc + 2a03cxWZYcaOw4kY8hhFYc96qAB0HR / 87eBtWYSXcx0e78DxGcl5Qi18GLaz4hBWfu7KaGp6cnxtltWP5uBQfBxhWfB7FykhbxujkKR95ntJdO8I63FHHKNMajzxP6R5WcDOsePImK2NTn5dpy2ojHfnwOoZOWHGdsOI6 + vHbueGoz8tNbW24hBV3CSvuElbc5RpWnjgvDqfUCSstrgOHlcfKyHaiDkzuEeg4bgBauRsnU8n17ZY1dNwAtHI3TqaS69sta + i4AWjlbpxMJde3W9YdRz4coKHjxTCmk9wL2XEMq3uw + gMoW5SpCmVuZHN0cmVhbQplbmRvYmoKOSAwIG9iago2NjcKZW5kb2JqCjEwIDAgb2JqCjw8Ci9UeXBlIC9YT2JqZWN0Ci9TdWJ0eXBlIC9JbWFnZQovV2lkdGggMTAwCi9IZWlnaHQgMTAwCi9CaXRzUGVyQ29tcG9uZW50IDgKL0NvbG9yU3BhY2UgL0RldmljZVJHQgovTGVuZ3RoIDExIDAgUgovRmlsdGVyIC9GbGF0ZURlY29kZQo + PgpzdHJlYW0KeJztkEGSw0AIA / P / T2evqTIj2sAk9lo62gxq + vWayfsjx4 + ryXBAL9fRPBeJXfE8yhXnmWJruiosb95oV / xGu + I32hW / sUk + xcYVwT38I7 / RruyKf / ytq7N / PwcK5Kv9dpUO2JVdHQcK5Kv9t3DFn8M9hUa7sqtbu + KBz8MiTbvaySfPQhJ4u + LwdsXh7YrDj0SzhZNbP249thm74nmCq / fOFFo429eu + E7siseueP6ZK133GgrH2BF++MjCHbR2xZff11WtsXN4 + rZzIwfjGPCu1U6O1IEMB3QjB + MY8K7VTo7UgQwHdCMHK2CEf9PlkHwK8tS9GhI + sas0dqXHOIZdcQxefaqofNfqif44pUVj2JVdnaLlGIXlUEvaWGDTRXx5DRjGrnjsiseuBm3Av5yHh5NP8RR2Fv7W2OzqXq6mWnh1OJA + 1x / h3xWS5rQru7KrC7qaatF70mi2ZmD1267sag5JTzYbm7SF5dpq4Ql5ZVd2dfaJXfEng66OT1aNHQMcY + ocPmlXfNKu + CQPfwvvSnlGaH / 7vDBpV3zSrvjkE1y9o4QD + jnf2RS4oxHGrnjsiids4ecUIGuNUzdO7bErvseuUrZCIE / 6MVwIqzlk7flU7IrHrnj + q6vjXbVM7Uz3wCtqWnRj566Ubcceu + J7ruAqZEjDMciBXEWaGjlsTJfzRrvijXbFGx / lqjBZeF7D6AhMGwt6 + fLOc76cPy / Erngu4orfFU7qj7yxebhd8cPtih9uV / zwra46ezTkqqjDs4NcT9oVn3ysK56zJ6Ttg2yFhI12pTk1 / OByMWZXT3PVjG6s7dHnhK / 0nmY7v4K3iBOatHbFaX / r6g + ZiNtUCmVuZHN0cmVhbQplbmRvYmoKMTEgMCBvYmoKNjQyCmVuZG9iagoxMiAwIG9iago8PAovVHlwZSAvWE9iamVjdAovU3VidHlwZSAvSW1hZ2UKL1dpZHRoIDEwMAovSGVpZ2h0IDEwMAovQml0c1BlckNvbXBvbmVudCA4Ci9Db2xvclNwYWNlIC9EZXZpY2VSR0IKL0xlbmd0aCAxMyAwIFIKL0ZpbHRlciAvRmxhdGVEZWNvZGUKPj4Kc3RyZWFtCnic7ZTLkgIxDAP3 / 3 + avVJFRu7IDgWMdBxiPfrA39 + MHk / a / dUzf6w0lXhUYcV1K1bL6FJGN + 1TnsDE8sTYGFZ8Y1jxjWHFNzbHTjUvg + Ac / quxccrHMC8TMaqwugUr0fb5ZfmRd4PpYcXTw4qnhxVP / 0BWekLTpzMnrMLqW1hxwfNlkG575alfclbGxrDiG8OKbwwrvnFKupvedeLj0bFNhRXXHVg9TkqncALl + Zt3nVBYcYUV14 + x4nOm9LYgmGjUCKuwKhObNbj5MkVHL8 + 1T6ndCVsvO + cnzLVPqbDSL6 + u3syqqVdzb3Vz73iNUUiX5s2SVw + g / 1SNUUiX5s2SVw + g / 1SNUUiX5s2SVw + g / 1QNHg2xlOZNFPrjUSxTK4zEsOKJX8fKK6ybQ5 / lr3yv9vRq6I / GxuVLw0dy2iup + /Aa+qOxcfnS8JGc9krqPryG/mhsXL40fCSnvZK6D69hmBs + fNfu7ZYU + h1p8zJafzQm7HKwg8KKB02xWqYY3fRHrwbvo088z5E52qdpHlZhtfRpmn8FK25eJuoTY45XAxLg3bgPL6lPdB + eWNbQkqjCqt7Iu3U2GqzKsfDXZZBxQq5E83IX / KjjypJhxUuGFS / 5yaw6u65qGJ5chqHx0lBpaKRwLHAOPzHMm7uWD5qeXIah8VI39wjsxm3V2L09fR5WYXXiPKxOsHrF8qj + NpslYaJXUnfTffjHsOIfb8uqOQeW5CcfMueoeVjdllXZzdB4H16Y79LdyvMphRVXWHH9KivdnGuKRukDV3hYdKLexRVWXLditexQCiZ6zeGEMpE314lhxRPDiieGFU + E0d7wEz67KVs1DLzc3Dhv + oQV9 / lVVrzGMlr30YklDT7cOAmrsCqHGydhdYIVpwGDjI882igZVmF1mpUxHD4ruxnmRluvRljxGmHFa4QVrzElw7w8Kfe + vjRuy8RxaGHFdQdW / 51toYAKZW5kc3RyZWFtCmVuZG9iagoxMyAwIG9iago3MjcKZW5kb2JqCjE0IDAgb2JqCjw8Ci9UeXBlIC9YT2JqZWN0Ci9TdWJ0eXBlIC9JbWFnZQovV2lkdGggMTAwCi9IZWlnaHQgMTAwCi9CaXRzUGVyQ29tcG9uZW50IDgKL0NvbG9yU3BhY2UgL0RldmljZVJHQgovTGVuZ3RoIDE1IDAgUgovRmlsdGVyIC9GbGF0ZURlY29kZQo + PgpzdHJlYW0KeJztkElihEAMA / n / pye3XDB2texmEpCO0NZSxzGjTyT + kp + HPkKNL8qsuF7Fik / gJXnzTnR5PrXRrJaCzIoHmRUPOvuEc / KXvFvuyT / m5vwj3zjlY1bcx6y4DzfvECgrdUqWG6d8zIr7mBX3MSvuk3 + 8Ot + XaFZm9a9ZcQmsmgo9V / toG82KbzQrvtGs + MbxCSWrez5uHduUWXG9gdVng2Bi2WdryT8is + IyK66nsspLcuXm5Ut + IvQZn2NWfI5Z8ZK3iffhK85 / NSz84z0yK64HsArPhZJhT40AT1ztU57nL82KvzQr / tKs + t06iflt6MM / lt06iU3lieFLviVvzhO5uLmgPDF8ybfkzXkiFzdPdpVYeA2BcxMF9 + wE8WlC4eYuOGHJsxPEpwmFm7vghCXPThCfJhRu7oITljyFoPBZ / nGqj1ByybNjnj8wq6sT + NesyvROtNZHsMo / cgJlT7MyK55oVjxRYNWcBs0HP + Ybw5K5eeljVvkDbm5WgjkXx8tLhuY8HUpL7MisuMyK61WsOnFl + lK3qZdQpeH5owoGNR8kwF9ClYbnjyoY1HyQAH8JVRqePwoEltIFAvk5P5nyMasdJ2ZlVlMn4RztI + TDzYU5V0G8klmZFXw5xYqn7JgjJJYvBd3T3Ky4 + cNY7VCeEv6dastPYMnd0MyKy6y4nspqSgIWrRucptUIDccBmtXUhIexCk9KCTV2 + ECkO0o2z82Kn5sVP38Vq3P0VQ1hY + 7JE / m5oDzRrHiiWfHErayuznOV6cnJbeZmxc3NipubFTcfZ9U84WOFOeFV / tGsDrPazEoo3LnVmguevLlZ8eZmxZubFW9e1ugoL6wBnHopjG2ec3MY3SQg + GtzhHNuDqObBAR / bc6vfgBg7DI2CmVuZHN0cmVhbQplbmRvYmoKMTUgMCBvYmoKNjcyCmVuZG9iagoxNiAwIG9iago8PAovVHlwZSAvWE9iamVjdAovU3VidHlwZSAvSW1hZ2UKL1dpZHRoIDEwMAovSGVpZ2h0IDEwMAovQml0c1BlckNvbXBvbmVudCA4Ci9Db2xvclNwYWNlIC9EZXZpY2VSR0IKL0xlbmd0aCAxNyAwIFIKL0ZpbHRlciAvRmxhdGVEZWNvZGUKPj4Kc3RyZWFtCnic7ZTLgYNQDAPTf9PZBow9yDZLQDq + YH3mkM9nRt9I4a / CuRaU + /yjzIrrVazClFLwfDA9Pw8NpzaalZDY9DkbZ1Y87jGs+C6hGxyrPeaJzY1TPmbFfcyK+/BzOFAwHCxpVma1UdKsfpcVF4fJfxU2TvmYFfd5LSuu3DyMy300ne2jbTQrvtGs + Eaz4hunJLBafVwd25RZcb2B1XdBeQrvs1ryJjIrLrPieiorYU65MUn5nPnH7nTbmLNqblbc / GGsymmCJ0zkPkKiNoE / NoOgeZjCa8BEbQJ / bAZB8zCF14CJ2oT8cUoCFn4ueJZjS8 + 8cEdmxWVWXK9iNVWyFPfJH8uNnRp5ilkdmZuVwEpDlERvSCCwEXS9jyCzmoo2Kx59PavykXfLP + PD85TQs0Pg6AT + qq3IPys9YYpZ8ZSbsNI8R8Zyq / yREzjV06x4T7PiPc2K9zzbVkgUDMvhworyy / E5q + ZmJRjemZWm3HBq7KkP5AllYiel9DEr7mNW3OdhrODYI8EvQ8 / +Ct4TdgsNYXMexPvkiWb1YFb545RKVqsSaphV88Ss + IlZ8ZPcJ9zLaTTNhTllEK9kVmYFv9xgFZrz87yDsCs8L78UBLGYVWhuVqX5hsYndKK1Ly + DZlZcZsX1VFZT4n2mgngf / hiajwM0K2HCG1iFJ6UEGoIPryGclF92Tspzs + LnZsXPX8WKj + 1sDD15Ij8XlCeaFU80K554GatOySNPGL1hblbc3Ky4uVlx8ylW + Xn + GW / OS / LE / NGsjrqZFe + Wj + XKz / PmQgqfI / Dhibx56Ml / NSv + q1nxXx / AqqmjIOG8A5CfCH2EXaV589yshG53Y / UHvWnwPwplbmRzdHJlYW0KZW5kb2JqCjE3IDAgb2JqCjY0MgplbmRvYmoKMTggMCBvYmoKPDwKL1R5cGUgL1hPYmplY3QKL1N1YnR5cGUgL0ltYWdlCi9XaWR0aCAxMDAKL0hlaWdodCAxMDAKL0JpdHNQZXJDb21wb25lbnQgOAovQ29sb3JTcGFjZSAvRGV2aWNlUkdCCi9MZW5ndGggMTkgMCBSCi9GaWx0ZXIgL0ZsYXRlRGVjb2RlCj4 + CnN0cmVhbQp4nO2YO2LDMAxDc / 9Lu1uXMuAzSSmNDIyOiM8b83rN6IqkXzbPw5fc54MyK65HsQpTUhXOlyaGv04lmhVPNCueaFY8UZuHKnRLfcKXhY / as7lxysesuI9ZcZ8Cq8JYLrPiMisus + L6OlZT0iTf1TArs + KJ / 40VlzYP47RPkxvsU9toVnyjWfGNZsU3TqnAaunHpWObMiuuJ7C6Fkjv0nPSjzpx6a4VMisus + I6lZUuycW38Je82545S83NipufykpHNz + GiRoa4SY8MZWxf1CnPpoV / 3gwq4J5 + ID7cMFEfjI1J03pmJsVNzcrbv69rNLbzhxuzj + mG7UKG83KrFawmuqjT2AH0q1QYyoofNbxCU + WTjArHm1WPHo / q1pJfaV9pkqGiU3zW + kkJQ3SPs05OrFpfiudpKRB2qc5Ryc2zXl6YU5o3plwS4XEAhazCj + alT55d2VWHVbcZ0VieNscDs0Lc5pYtLlZcfMzWE2dcHX6kAd3VUvszOEyKy6z4jqMFRybpvO42op1c8IHU + Zmxc0fxYpHayxcaWF9VUhs + phV88Ss + IlZNU80t / SjZs599szRL5vmZsXNH8uq4FMrDKWZv6M6JTg2PDErs0rNV6iQMtWWn + iX26CZFZdZcZ3Kako8caqbPk + x8D7jAM2q1vx4VuFJqkKNsE / HJ7SqNR8 / Sc / Nip + bFT9 / FKtwBZ / z96M2TF + m3XgQlE40K55oVjxxG6sLK00XJ9vMzYqbmxU3NytuvocV / 8jHFuYUupkV72ZWvJsulhZuzoEp6dXSRLPiiWbFE82KJ2pzrjCoEN2cw0 / 4HLPic8yKz / nVD3M / WfIKZW5kc3RyZWFtCmVuZG9iagoxOSAwIG9iago2MjcKZW5kb2JqCjIwIDAgb2JqCjw8Ci9UeXBlIC9YT2JqZWN0Ci9TdWJ0eXBlIC9JbWFnZQovV2lkdGggMTAwCi9IZWlnaHQgMTAwCi9CaXRzUGVyQ29tcG9uZW50IDgKL0NvbG9yU3BhY2UgL0RldmljZVJHQgovTGVuZ3RoIDIxIDAgUgovRmlsdGVyIC9GbGF0ZURlY29kZQo + PgpzdHJlYW0KeJztkEFixDAIA / f / n24fEAxjgbdpIo6JEaP5fGbmJ5rwL1xZPSi3kos3Gbvi8ypXHEwrPl5nCpKv2xVftyu + bld8XSAvMYRwoeM4JAe2Kw5sVxz4BAY3AFe2MOxq / CIPn8qxKw2yQ25XeeDqZVh8HJKvT + XYVRPjDa74QLYcbKvjCM / W2JWQaVc806545tTkbOHLox + Plm2OXfF5g6ufAzNlgEN + p9eJsSs + dsXnqa7C8BA4n + ZFuLK6mGdO1clPN8P5Rbiyugg7Nuvkp5vh / CJcWV2EHafqTBko14WyfJ2Hdz7aFf9oV0220MDfTsiWA8O / 5IFd2dXuX7vifzVX8Bm3WobnF0vyXAsnR1Wr03zFrvjKg10d7cgvQh7CmRgYvJgz8I92xT / aFf / 4eFfcgHCxqXd1vXMx38o / 8jpluEDOB3hCF / Ot / COvU4YL5HyAJ3Qx31pFQZ5d2i3yHENb3 + 2ljV1NZdoVz3ytK77OBea9eA7n2f3brHM03K54 + DNc8eHFYVnhNM / UDOQdBeCyhV3ZlQBctniqqxyj + VEwMGVDM8A7drTwjnbFOz7A1VYL2FH4y8MFk9xVvmJXZXj4TGtxjRL + 8nC74uE3cdUcoWD4slN20JVQh49d8XmVqzCn + bLTsRnerHP9a1d2VQ5nOzFfvqIVzLe + Js2uhBYnwq9X7Ipf + ZqrqWl2HH8Z / i0 / hoHjAu2Kz6tc8bKDGAmPhsR3BUi74pB2xSHtikPmZfnLJoYAHK7zlQ65XdkV372zq9MCrzlT4XZlVx + 72pn / 5arMEazmwMJK2VfIsSu7Kvtycl5nd3e1zg0nvQbZ7Iqz2RVnsyvOFvIIU3bMV7grmNmEnOJpYuQ8dsV57uzqF / EZXt8KZW5kc3RyZWFtCmVuZG9iagoyMSAwIG9iago2NTkKZW5kb2JqCjIyIDAgb2JqCjw8Ci9UeXBlIC9YT2JqZWN0Ci9TdWJ0eXBlIC9JbWFnZQovV2lkdGggMTAwCi9IZWlnaHQgMTAwCi9CaXRzUGVyQ29tcG9uZW50IDgKL0NvbG9yU3BhY2UgL0RldmljZVJHQgovTGVuZ3RoIDIzIDAgUgovRmlsdGVyIC9GbGF0ZURlY29kZQo + PgpzdHJlYW0KeJztkNF1A0EIA9N / 004BxmJWcPeSs / S5C0Kan58dvSrp31Zbh5YqrimsuL6K1bCOUda7Dj15SOPi0AdeCauwOvKBV57HqszDY + h1nVwTaB + 157Djlk9YcZ + w4j76kffSZbnCiiusuMKK6xms7rkYVmH1r1lx3cOq3OLhtzqGFe8YVrxjWPGOW + Ks7nm8tOxQYcX1DaxeF0j30nXax9Lzihb3KKy4worrqax0SK71PC1VnmerzqXmYcXNH8aKG5aT / BGuHHF7nzT4aB / PPKzC6gpW2qcc8Dyh9EUe0pj0eukBzzOsuGdYcc + /z+ooG/QxzmkCRx21uLmhsPJafCcraPipOKzAsQxRaJ9W / JA + zR9Pf9uOXmBDA1RhdaC2OKTRBtuqcAJmdEifNrLxlSGBdfNygPsYLbxsp1deYYWvvO5iBX / bkOU6D6knjY6cgFHcWPnUUf + WV84wARq8o1HcWPnUUf + WV84wARq8o1HcWPnUUf + WV84wARq8Iy9u5DHEWbWPpadRRw8MzScKK65nsIK / 7RUuw / xo4FT8YrlimHNtJeeeWxfLFcOcays599y6WK4Y5lxbybnnFRffJ4cduQzPrevtaUi19QyrsCoHJmmH0vBbDa2M3bDaWgkrvhJW7Qp / LJNPEJWTxiMv3mbTY2GlJ1ssYaWxtCF5NqOOvsizDaWTG3nCiuf5BlZXaL3C5LQ3eRu0sOIKK66nstrSVvIr8vDHMs96yLDysj2eVVtHe + riHAuvwy / y5Osr7XpY8fWw4utfxWpY5 / 2Rt + AXywGdnEtfDCt + Maz4xStYcR + Pm1i5zTysuHlYcfOw4uZbrEpDXmES2KujYwzN4WObjU / CwF4dHWNoDh / bbHwSBvbq6BiwQlsNjn0CaCRvJyFAI7DO0GbjFXQvvt5OhhU / FFb80HWshtIx5p4TgNxHG3ottPn749wzrLjnX2D1C8o5T + 4KZW5kc3RyZWFtCmVuZG9iagoyMyAwIG9iago3MjIKZW5kb2JqCjI0IDAgb2JqCjw8Ci9UeXBlIC9YT2JqZWN0Ci9TdWJ0eXBlIC9JbWFnZQovV2lkdGggMTAwCi9IZWlnaHQgMTAwCi9CaXRzUGVyQ29tcG9uZW50IDgKL0NvbG9yU3BhY2UgL0RldmljZVJHQgovTGVuZ3RoIDI1IDAgUgovRmlsdGVyIC9GbGF0ZURlY29k
                */
                var docData = result.split(',')[1];
                var dataDoc = {
                    wFormat: wFormat,
                    //ColorType: 11,
                    //ulDpm: 0,
                    szOriFileNameDOC1: fileName,
                    ulOvwEdge: ovwEdge,
                    //ulPrevEdge: prevEdge,
                    ContentEncoding: 4096
                }
                // UTC-Zeit in Klartext
                var now = new Date();
                var dateStringUtc = now.toUTCString();
                var ret = new WinJS.Promise.as().then(function() {
                    return WinJS.Promise.timeout(50);
                }).then(function () {
                    var ovwData = docData;
                    dataDoc.ulWidth = doc.width;
                    dataDoc.ulHeight = doc.height;

                    // decodierte Dateigröße
                    var contentLength = Math.floor(docData.length * 3 / 4);

                    dataDoc.DocContentDOCCNT1 = "Content-Type: " + mimeType + ";charset=UTF-8\x0D\x0ALast-Modified: " +
                        dateStringUtc +
                        "\x0D\x0AContent-Length: " +
                        contentLength +
                        "\x0D\x0A\x0D\x0A" +
                        docData;

                    if (ovwData && ovwData.length < prevLength) {
                        var contentLengthOvw = Math.floor(ovwData.length * 3 / 4);
                        //change mimetype
                        dataDoc.OvwContentDOCCNT3 =
                            "Content-Type: " + mimeType + "Accept-Ranges: bytes\x0D\x0ALast-Modified: " +
                            dateStringUtc + 
                            "\x0D\x0AContent-Length: " +
                            contentLengthOvw +
                            "\x0D\x0A\x0D\x0A" +
                            ovwData;
                    }
                    AppBar.busy = true;
                    return UploadMedia.docView.insert(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        AppBar.busy = false;
                        Log.print(Log.l.trace, "docView insert: success!");
                        // select returns object already parsed from json file in response
                        if (json && json.d) {
                            that.binding.dataDoc = json.d;
                            if (wGroupDoc === 1) {
                                that.binding.docId = json.d.DOC1MandantDokumentVIEWID;
                            } else if (wGroupDoc === 3) {
                                that.binding.docId = json.d.DOC3MandantDokumentVIEWID;
                            }
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppBar.busy = false;
                        AppData.setErrorMsg(that.binding, errorResponse);
                    },
                        dataDoc, that.binding.docId, wGroupDoc);
                }).then(function () {
                    if (AppBar.scope && typeof AppBar.scope.loadList === "function") {
                        return AppBar.scope.loadList(that.binding.docId);
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (AppBar.scope && typeof AppBar.scope.loadDoc === "function") {
                        return AppBar.scope.loadDoc(that.binding.docId, wGroupDoc, wFormat); // 1
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    that.binding.fileInfo = "";
                    that.binding.showLoadingCircle = false;
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.insertOtherDocData = insertOtherDocData;

            function getFileData(file, name, type, size) {
                var posExt = name.lastIndexOf(".");
                var ext = (posExt >= 0) ? name.substr(posExt + 1) : "";
                Log.call(Log.l.trace, "UploadMedia.Controller.", "name=" + name + " ext=" + ext + " type=" + type + " size=" + size);
                that.binding.fileInfo = name + " (" + type + ") - " + size + " bytes";

                var fileExtensions = UploadMedia.docFormatList.map(function(item) {
                    return item.fileExtension;
                });
                var index = fileExtensions.indexOf(type);
                if (index < 0 || UploadMedia.docFormatList[index].mimeType !== type) {
                    var mimeTypes = UploadMedia.docFormatList.map(function(item) {
                        return item.mimeType;
                    });
                    index = mimeTypes.indexOf(type);
                }
                var docFormat = (index >= 0) ? UploadMedia.docFormatList[index] : null;
                if (docFormat) {
                    var reader = new FileReader();
                    reader.onload = function() {
                        // reader.result
                        if (reader.result) {
                            Log.print(Log.l.u1, "result=" + reader.result.substr(0, 64) + "...");
                            switch (docFormat.docGroup) {
                                case 1:
                                    that.insertImage(docFormat.docFormat, type, name, reader.result);
                                    break;
                                default:
                                    that.insertOtherDocData(docFormat.docFormat, docFormat.docGroup, type, name, reader.result);
                                break;
                            }
                            /*var base64String = reader.result;
                             test wandle base64 to blob bzw. file und dann speicher
                            if (base64String) {
                                var blob = that.base64ToBlob(base64String, type);
                                saveAs(blob, "Test.pdf");
                            }*/
                        }
                    };
                    // setze input-feld value auf leer
                    fileOpener.value = "";
                    reader.onerror = function(error) {
                        AppData.setErrorMsg(that.binding, error);
                    };
                    reader.readAsDataURL(file);
                } else {
                    AppData.setErrorMsg(that.binding, "unknown file type: " + type);
                }
                Log.ret(Log.l.trace);
            }
            that.getFileData = getFileData;

            var eventHandlers = {
                handleFileChoose: function (event) {
                    that.binding.showLoadingCircle = true;
                    if (event && event.target) {
                        // FileList-Objekt des input-Elements auslesen, auf dem 
                        // das change-Event ausgelöst wurde (event.target)
                        var files = event.target.files;
                        for (var i = 0; i < files.length; i++) {
                            getFileData(files[i], files[i].name, files[i].type, files[i].size);
                        }
                    }
                },
                onDragOver: function(event) {
                    if (event) {
                        event.stopPropagation();
                        event.preventDefault();
                        if (event.dataTransfer) {
                            event.dataTransfer.dropEffect = "copy";
                        }
                    }
                },
                onDrop: function(event) {
                    that.binding.showLoadingCircle = true;
                    if (event) {
                        event.stopPropagation();
                        event.preventDefault();
                        if (event.dataTransfer) {
                            var files = event.dataTransfer.files; // FileList Objekt
                            for (var i = 0; i < files.length; i++) {
                                getFileData(files[i], files[i].name, files[i].type, files[i].size);
                            }
                        }
                    }
                },
                clickUpload: function(event) {
                    if (fileOpener) {
                        fileOpener.click();
                    }
                }
            };
            this.eventHandlers = eventHandlers;

            var disableHandlers = {
                clickUpload: function() {
                    return AppBar.busy || !that.binding.docId;
                }
            }
            this.disableHandlers = disableHandlers;
            
            // Initialisiere Drag&Drop EventListener
            if (dropZone) {
                this.addRemovableEventListener(dropZone, "dragover", this.eventHandlers.onDragOver.bind(this));
                this.addRemovableEventListener(dropZone, "drop", this.eventHandlers.onDrop.bind(this));
                this.addRemovableEventListener(dropZone, "click", this.eventHandlers.clickUpload.bind(this));
            }

            //Initialisiere fileOpener           
            if (fileOpener) {
                var accept = "";
                var mimeTypes = UploadMedia.docFormatList.map(function(item) {
                    return item.mimeType;
                });
                var uniqueMimeTypes = mimeTypes.filter(function(item, index) {
                    return mimeTypes.indexOf(item) === index;
                });
                for (var i = 0; i < uniqueMimeTypes.length; i++) {
                    if (accept) {
                        accept += ",";
                    }
                    accept += uniqueMimeTypes[i];
                }
                fileOpener.setAttribute("accept", accept);
                this.addRemovableEventListener(fileOpener, "change", this.eventHandlers.handleFileChoose.bind(this));
            }

            var setDocId = function(docId) {
                that.binding.docId = docId;
            }
            this.setDocId = setDocId;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                that.updateCommands();
            });
            Log.ret(Log.l.trace);
        })
    });
})();




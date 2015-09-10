<%@ WebHandler Language="C#" Class="Notes" %>

using System;
using System.Configuration;
using System.Web;
using GatewayCode.Modules.PanelsManagement.DataAccess;

public class Notes : IHttpHandler 
{
    string connString = ConfigurationManager.AppSettings["PMConnString"];
    public void ProcessRequest (HttpContext context) 
    {
        context.Response.ContentType = "text/plain";

        int id = context.Request["id"].ToInt32();
        string action = context.Request["action"];

        if (id == 0)
        {
            context.Response.Write("invalid id");
            return;
        }
        switch (action)
        {
            case "delete":
                PMDataAccess.DeleteNoteById(id, connString);
                context.Response.Write("d");
                break;
            default:context.Response.Write("default");
            break;
        }
        
       
    }
 
    public bool IsReusable 
    {
        get {
            return false;
        }
    }

}